import { TestBed } from '@angular/core/testing';
import { FakeTransport } from '../../../testing/fake-transport';
import { NowPlayingTransport } from '../now-playing/transport';
import { WEBAMP_ENGINE, WinampService } from './winamp.service';
import type { EnginePlaybackStatus } from './playback-state';

/**
 * The engine, as far as the wrapper's transport commands reach: the status
 * read the guard decides on and the verbs it may call. `store.subscribe` and
 * `onTrackDidChange` stand in for the wires the tune gate follows.
 */
class FakeEngine {
  status: EnginePlaybackStatus = 'STOPPED';
  calls: string[] = [];
  getPlayerMediaStatus(): EnginePlaybackStatus {
    return this.status;
  }
  play(): void {
    this.calls.push('play');
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
  onTrackDidChange = () => () => undefined;
}

let engine: FakeEngine;

describe('WinampService transport commands', () => {
  let service: WinampService;

  beforeEach(() => {
    engine = new FakeEngine();
    TestBed.configureTestingModule({
      providers: [
        { provide: WEBAMP_ENGINE, useValue: engine },
        // The tune gate follows real wires into Now Playing; only the
        // transport it polls the streams with is a double.
        { provide: NowPlayingTransport, useValue: new FakeTransport() },
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
    engine.status = 'PAUSED';
    service.play();
    engine.status = 'PLAYING';
    service.play();
    expect(engine.calls).toEqual(['play']);
  });

  it('reopens a closed player before playing', () => {
    engine.status = 'CLOSED';
    service.play();
    expect(engine.calls).toEqual(['reopen', 'play']);
  });

  it('passes Next and Previous through untouched while paused — the engine tunes and auto-plays the track itself', () => {
    engine.status = 'PAUSED';
    service.next();
    service.prev();
    expect(engine.calls).toEqual(['next', 'prev']);
  });
});
