import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import Stations from '../../data/stations';
import { FakeMediaElement } from '../../../testing/fake-media-element';
import { FakeTransport } from '../../../testing/fake-transport';
import { FakeMediaSession } from '../../../testing/fake-media-session';
import { MEDIA_SESSION } from './media-session';
import { NowPlayingService } from '../now-playing/now-playing.service';
import { NowPlayingTransport } from '../now-playing/transport';
import { WEBAMP_ENGINE, WinampService } from './winamp.service';
import { EngineTrack } from './tune-gate';
import type { EnginePlaybackStatus } from './playback-state';

/**
 * The engine, as far as the wrapper's transport commands reach: the status
 * read the guard decides on and the verbs it may call. `store.subscribe` and
 * `onTrackDidChange` stand in for the wires the tune gate follows.
 */
class FakeEngine {
  status: EnginePlaybackStatus = 'STOPPED';
  calls: string[] = [];
  private trackCallback: ((track: EngineTrack | null) => void) | undefined;
  getPlayerMediaStatus(): EnginePlaybackStatus {
    return this.status;
  }
  play(): void {
    this.calls.push('play');
  }
  setTracksToPlay(): void {
    this.calls.push('setTracks');
  }

  /** Fires the track-change hook the tune gate follows, the engine's way. */
  emitTrack(url: string): void {
    this.trackCallback?.({ url });
  }
  pause(): void {
    this.calls.push('pause');
  }
  reopen(): void {
    this.calls.push('reopen');
  }
  nextTrack(): void {
    this.calls.push('next');
  }
  previousTrack(): void {
    this.calls.push('prev');
  }
  stop(): void {
    this.calls.push('stop');
  }
  store = { subscribe: () => () => undefined };
  onTrackDidChange(cb: (track: EngineTrack | null) => void): () => void {
    this.trackCallback = cb;
    return () => undefined;
  }
}

let engine: FakeEngine;
let mediaSession: FakeMediaSession;

describe('WinampService transport commands', () => {
  let service: WinampService;

  beforeEach(() => {
    engine = new FakeEngine();
    mediaSession = new FakeMediaSession();
    TestBed.configureTestingModule({
      providers: [
        { provide: WEBAMP_ENGINE, useValue: engine },
        // The tune gate follows real wires into Now Playing; only the
        // transport it polls the streams with is a double.
        { provide: NowPlayingTransport, useValue: new FakeTransport() },
        // The adapter writes to this session; the spec fires its handlers.
        { provide: MEDIA_SESSION, useValue: mediaSession },
      ],
    });
    service = TestBed.inject(WinampService);
  });

  it('lets a second Pause stand — it does not resume', () => {
    engine.status = 'PLAYING';
    service.pause();
    engine.status = 'PAUSED';
    service.pause();
    expect(engine.calls).toEqual(['pause']);
  });

  it('lets a second Play stand — it does not restart', () => {
    engine.emitTrack(Stations.stations[0].url); // a Station tuned first
    engine.status = 'PAUSED';
    service.play();
    engine.status = 'PLAYING';
    service.play();
    expect(engine.calls).toEqual(['play']);
  });

  it('reopens a closed player before playing', () => {
    engine.emitTrack(Stations.stations[0].url); // a Station tuned first
    engine.status = 'CLOSED';
    service.play();
    expect(engine.calls).toEqual(['reopen', 'play']);
  });

  it('Play before any gesture tunes the first Station and plays it', () => {
    service.play();
    expect(engine.calls).toEqual(['reopen', 'setTracks', 'play']);
  });

  it('passes Next and Previous through untouched while paused — the engine tunes and auto-plays the track itself', () => {
    engine.status = 'PAUSED';
    service.next();
    service.prev();
    expect(engine.calls).toEqual(['next', 'prev']);
  });

  it('installs the OS widget’s play, pause, previous and next — and no seek handler', () => {
    expect([...mediaSession.handlers.keys()].sort()).toEqual([
      'nexttrack',
      'pause',
      'play',
      'previoustrack',
    ]);
  });

  it('the OS widget’s Pause cannot resume an already paused player', () => {
    engine.status = 'PLAYING';
    mediaSession.handlers.get('pause')!();
    engine.status = 'PAUSED';
    mediaSession.handlers.get('pause')!();
    expect(engine.calls).toEqual(['pause']);
  });
});

/**
 * The one behaviour asserted against the outside world: no media request is
 * issued before the gesture. The engine double above cannot say that — the
 * request lives in the audio element the real engine builds — so these specs
 * run the token's real factory behind a recording media element.
 */
describe('WinampService opens no stream before a gesture', () => {
  let service: WinampService;

  beforeEach(() => {
    FakeMediaElement.install();
    TestBed.configureTestingModule({
      // No engine double: the factory's construction and playlist fill are
      // part of what is asserted. The only network the tune gate could reach
      // is the transport, which stays a double.
      providers: [
        { provide: NowPlayingTransport, useValue: new FakeTransport() },
      ],
    });
    service = TestBed.inject(WinampService);
  });

  afterEach(() => {
    FakeMediaElement.restore();
  });

  it('constructing the player performs no media request, lists every Station, and leaves no row reading as current', async () => {
    expect(FakeMediaElement.requests).toEqual([]);
    const engine = TestBed.inject(WEBAMP_ENGINE);
    expect(engine.getPlaylistTracks().length).toBe(Stations.stations.length);
    // The listener's own surfaces: nothing plays, and Now Playing carries no
    // reading — no row is current until a gesture tunes one.
    expect(await firstValueFrom(service.playbackState$)).toBe('none');
    expect(
      await firstValueFrom(TestBed.inject(NowPlayingService).nowPlaying$),
    ).toBe(undefined);
  });

  it('the playlist repeats, so Next on the last Station wraps rather than ending the broadcast', () => {
    expect(TestBed.inject(WEBAMP_ENGINE).isRepeatEnabled()).toBe(true);
  });

  it('the first Play is the gesture: it tunes the first Station and is the first media request', () => {
    service.play();
    expect(FakeMediaElement.requests).toEqual([Stations.stations[0].url]);
  });
});
