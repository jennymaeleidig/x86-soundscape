import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import Stations, { Station } from '../../../assets/audio/stations';
import { DrivenSource } from '../../../testing/driven-source';
import { FakeTransport } from '../../../testing/fake-transport';
import { drainMicrotasks, withFakeTimers } from '../../../testing/flush';
import { icyPayload, plainStation } from '../../../testing/icy';
import { NowPlayingService } from '../now-playing/now-playing.service';
import { NowPlayingTransport } from '../now-playing/transport';
import { NowPlaying } from '../now-playing/parsers';
import { PlaybackState, playbackState$ } from './playback-state';
import {
  EngineTrack,
  TuneGate,
  TrackChangeSource,
  wireTuneGate,
} from './tune-gate';

/** A track as the engine's hook carries it: enough for the wiring to match. */
const engineTrack = (station: Station): EngineTrack => ({ url: station.url });

/**
 * The engine double: the spec plays the track-change events the store's
 * subscriber would be told about.
 */
class DrivenEngine implements TrackChangeSource {
  change: (track: EngineTrack | null) => void = () => {};

  onTrackDidChange(cb: (track: EngineTrack | null) => void): () => void {
    this.change = cb;
    return () => {
      this.change = () => {};
    };
  }
}

/** The tune double: what the player called, in order, on which Station. */
class RecordingTune implements TuneGate {
  calls: string[] = [];
  tuned: Station[] = [];

  tune(station: Station): void {
    this.calls.push('tune');
    this.tuned.push(station);
  }

  stop(): void {
    this.calls.push('stop');
  }

  suspend(): void {
    this.calls.push('suspend');
  }

  resume(): void {
    this.calls.push('resume');
  }
}

describe('the player drives Now Playing', () => {
  it('a track change tunes the Station it carries', () => {
    const engine = new DrivenEngine();
    const tune = new RecordingTune();
    wireTuneGate(engine, new Subject<PlaybackState>(), Stations.stations, tune);

    const expected = Stations.stations[2];
    engine.change(engineTrack(expected));
    expect(tune.calls).toEqual(['tune']);
    expect(tune.tuned[0]).toBe(expected);
  });

  it("the hook's no track decides nothing: a pause and a stop fire it alike, so neither stops the tune here", () => {
    const engine = new DrivenEngine();
    const tune = new RecordingTune();
    wireTuneGate(engine, new Subject<PlaybackState>(), Stations.stations, tune);

    engine.change(null);
    expect(tune.calls).toEqual([]);
  });

  it('a playing track that is no Station is nothing to tune: the tune is released', () => {
    const engine = new DrivenEngine();
    const tune = new RecordingTune();
    wireTuneGate(engine, new Subject<PlaybackState>(), Stations.stations, tune);

    engine.change({ url: 'https://example.com/not-a-station.mp3' });
    expect(tune.calls).toEqual(['stop']);
  });

  it('the state gates the tune: playing resumes it, pausing suspends it, none stops it', () => {
    const engine = new DrivenEngine();
    const tune = new RecordingTune();
    const states = new Subject<PlaybackState>();
    wireTuneGate(engine, states, Stations.stations, tune);

    states.next('playing');
    states.next('paused');
    states.next('none');
    expect(tune.calls).toEqual(['resume', 'suspend', 'stop']);
  });
});

/**
 * The wiring against the real player's state and the real tune: the ticket's
 * sentences, driven the way the engine performs them.
 */
describe('the tune follows the player, end to end', () => {
  let service: NowPlayingService;
  let transport: FakeTransport;
  let source: DrivenSource;
  let engine: DrivenEngine;
  let seen: (NowPlaying | undefined)[];

  beforeEach(() => {
    transport = new FakeTransport();
    TestBed.configureTestingModule({
      providers: [{ provide: NowPlayingTransport, useValue: transport }],
    });
    service = TestBed.inject(NowPlayingService);

    source = new DrivenSource();
    engine = new DrivenEngine();
    seen = [];
    service.nowPlaying$.subscribe((reading) => seen.push(reading));
    wireTuneGate(
      engine,
      playbackState$(source, 60_000),
      Stations.stations,
      service,
    );
  });

  /** Fire the coalesced read, then let whatever it started settle. */
  const settle = async () => {
    jest.advanceTimersByTime(0);
    await drainMicrotasks();
  };

  /** The station a transport attempt was for. */
  const attemptsFor = (station: Station) =>
    transport.sources.filter(
      (s) => s.via === 'library' && s.url === station.url,
    ).length;

  it('pausing suspends the poll and keeps the reading on the bar; nothing is fetched while paused', async () => {
    await withFakeTimers(async () => {
      const station = plainStation();

      // Skipping to the Station starts it playing: the hook tunes, the state
      // lands on playing and the first attempt fetches immediately.
      transport.queue(icyPayload('Artist - Title'));
      engine.change(engineTrack(station));
      source.now = 'PLAYING';
      source.notify();
      await settle();
      expect(seen.at(-1)).toEqual({ artist: 'Artist', title: 'Title' });
      expect(attemptsFor(station)).toBe(1);

      // The listener pauses: the tune is parked, the reading stands, and no
      // clock tick fetches anything.
      source.now = 'PAUSED';
      source.notify();
      await settle();
      expect(transport.cancelled).toBeGreaterThan(0);
      jest.advanceTimersByTime(120_000);
      await drainMicrotasks();
      expect(attemptsFor(station)).toBe(1);
      expect(seen.at(-1)).toEqual({ artist: 'Artist', title: 'Title' });
    });
  });

  it('stopping, closing the player and the stream ending each release the tune and clear the bar', async () => {
    await withFakeTimers(async () => {
      const station = plainStation();

      // Skin Stop: the hook fires no track (it cannot tell a pause from a
      // stop), the state reaches none, and none stops the tune.
      transport.queue(icyPayload('Artist - Title'));
      engine.change(engineTrack(station));
      source.now = 'PLAYING';
      source.notify();
      await settle();
      source.now = 'STOPPED';
      source.notify();
      await settle();
      expect(seen.at(-1)).toBeUndefined();
      expect(transport.cancelled).toBeGreaterThan(0);

      // Closing the player: CLOSED reads none, the tune is released, and the
      // closed player performs no polling however long the clock runs.
      transport.queue(icyPayload('Artist - Title'));
      engine.change(engineTrack(station));
      source.now = 'PLAYING';
      source.notify();
      await settle();
      source.now = 'CLOSED';
      source.notify();
      await settle();
      expect(seen.at(-1)).toBeUndefined();
      jest.advanceTimersByTime(120_000);
      await drainMicrotasks();
      expect(attemptsFor(station)).toBe(2); // only the two play gestures fetched

      // The stream ending: ENDED reads none, same release.
      transport.queue(icyPayload('Artist - Title'));
      engine.change(engineTrack(station));
      source.now = 'PLAYING';
      source.notify();
      await settle();
      source.now = 'ENDED';
      source.notify();
      await settle();
      expect(seen.at(-1)).toBeUndefined();
    });
  });

  it('resuming lands a fresh tick immediately', async () => {
    await withFakeTimers(async () => {
      const station = plainStation();
      transport.queue(icyPayload('Artist - Title'));
      engine.change(engineTrack(station));
      source.now = 'PLAYING';
      source.notify();
      await settle();
      expect(seen.at(-1)).toEqual({ artist: 'Artist', title: 'Title' });

      source.now = 'PAUSED';
      source.notify();
      await settle();
      expect(attemptsFor(station)).toBe(1);

      // Play again: the parked chain restarts with an immediate attempt. The
      // coalesced read fires on the first tick; the attempt it starts is
      // already in flight before any clock moves.
      transport.queue(icyPayload('Fresh - Track'));
      source.now = 'PLAYING';
      source.notify();
      jest.advanceTimersByTime(0);
      expect(attemptsFor(station)).toBe(2);
      await drainMicrotasks();
      expect(seen.at(-1)).toEqual({ artist: 'Fresh', title: 'Track' });
    });
  });

  it('Next and Previous while paused tune the new Station and play it, and the gate adds no duplicate attempt', async () => {
    await withFakeTimers(async () => {
      const first = plainStation();
      const second = Stations.stations.find(
        (candidate) => candidate !== first,
      )!;

      transport.queue(icyPayload('First - Track'));
      engine.change(engineTrack(first));
      source.now = 'PLAYING';
      source.notify();
      await settle();
      source.now = 'PAUSED';
      source.notify();
      await settle();
      expect(seen.at(-1)).toEqual({ artist: 'First', title: 'Track' });

      // Skip while paused: the engine starts the new track, so the hook fires
      // with it and the state reaches playing — tune, not a stopped tune.
      transport.queue(icyPayload('Second - Track'));
      engine.change(engineTrack(second));
      source.now = 'PLAYING';
      source.notify();
      await settle();
      expect(seen.at(-1)).toEqual({ artist: 'Second', title: 'Track' });
      expect(attemptsFor(second)).toBe(1); // the tune's own attempt; resume added none
    });
  });
});
