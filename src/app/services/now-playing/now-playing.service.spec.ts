import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import Stations from '../../data/stations';
import { FakeTransport } from '../../../testing/fake-transport';
import { drainMicrotasks, flush, withFakeTimers } from '../../../testing/flush';
import { icyPayload, plainStation } from '../../../testing/icy';
import { NowPlayingService } from './now-playing.service';
import { NowPlaying } from './parsers';
import { NowPlayingTransport } from './transport';

const azuracastPayload = (artist: string, title: string) => ({
  now_playing: { song: { artist, title } },
});
const icestatsPayload = (entry: unknown) => ({
  icestats: { source: entry },
});

describe('NowPlayingService', () => {
  let service: NowPlayingService;
  let transport: FakeTransport;

  /** The readings the listener sees, collected as they are announced. */
  async function readings(): Promise<(NowPlaying | undefined)[]> {
    const seen: (NowPlaying | undefined)[] = [];
    const done = firstValueFrom(service.nowPlaying$).then(() => seen);
    service.nowPlaying$.subscribe((reading) => seen.push(reading));
    return done;
  }

  beforeEach(() => {
    transport = new FakeTransport();
    TestBed.configureTestingModule({
      providers: [{ provide: NowPlayingTransport, useValue: transport }],
    });
    service = TestBed.inject(NowPlayingService);
  });

  it('shows the Station descriptor at once, for every kind, before any payload arrives', async () => {
    const kinds = Stations.stations.filter((station) => station.metadataParser);
    for (const station of kinds) {
      const seen = await readings();
      service.tune(station);
      await seen;
      transport.queue(undefined); // keep the next tune's first attempt settled
      expect(seen.at(-1)).toEqual({
        artist: station.metaData!.artist,
        title: station.metaData!.title,
      });
    }
    expect(kinds.length).toBeGreaterThanOrEqual(3);
  });

  it('replaces the descriptor with a track, and a payload carrying no track changes nothing', async () => {
    const station = Stations.stations.find(
      (candidate) => candidate.metadataParser?.kind === 'icestats',
    )!;
    const seen = await readings();
    transport.queue(
      icestatsPayload([
        { yp_currently_playing: 'A Forest', artist: 'The Cure' },
      ]),
    );
    service.tune(station);
    await flush();
    expect(seen.at(-1)).toEqual({ artist: 'The Cure', title: 'A Forest' });

    transport.queue(icestatsPayload({ yp_currently_playing: '' }));
    await flush();
    expect(seen.at(-1)).toEqual({ artist: 'The Cure', title: 'A Forest' });
  });

  it('reads a payload the way its kind asks, and a Station naming no parser gets icy once', async () => {
    const plain = Stations.stations.find(
      (candidate) => !candidate.metadataParser,
    )!;
    const azuracast = Stations.stations.find(
      (candidate) => candidate.metadataParser?.kind === 'azuracast',
    )!;

    const seen = await readings();
    transport.queue(icyPayload('Artist One - Title One'));
    service.tune(plain);
    await flush();
    expect(seen.at(-1)).toEqual({ artist: 'Artist One', title: 'Title One' });

    transport.queue(azuracastPayload('Artist Two', 'Title Two'));
    service.tune(azuracast);
    await flush();
    expect(seen.at(-1)).toEqual({ artist: 'Artist Two', title: 'Title Two' });
    expect(transport.sources.at(-1)).toEqual({
      via: 'fetch',
      endpoint: expect.stringContaining('/api/nowplaying/'),
    });
  });

  it('never fetches for a Station that polls none, and a malformed payload arrives as nothing', async () => {
    const none = Stations.stations.find(
      (candidate) => candidate.metadataParser?.kind === 'none',
    );
    const seen = await readings();

    if (none) {
      service.tune(none);
      expect(transport.sources).toEqual([]);
    }

    const plain = Stations.stations.find(
      (candidate) => !candidate.metadataParser,
    )!;
    transport.queue('not an icy payload at all');
    service.tune(plain);
    await flush();
    expect(seen.at(-1)).toEqual({
      artist: plain.metaData!.artist,
      title: plain.metaData!.title,
    });
  });

  it('publishes undefined on stop, and a payload landing after the stop changes nothing', async () => {
    const station = Stations.stations.find(
      (candidate) => !candidate.metadataParser,
    )!;
    const seen = await readings();
    transport.queue(icyPayload('Artist - Title'));
    service.tune(station);
    await flush();
    expect(seen.at(-1)).toEqual({ artist: 'Artist', title: 'Title' });

    const late = transport.deferred();
    transport.queue(late.promise);
    service.stop();
    expect(seen.at(-1)).toBeUndefined();
    expect(transport.cancelled).toBeGreaterThan(0);

    // The ICY path provably can call back after teardown: the payload lands,
    // and the reading the listener sees is still the stopped one.
    late.resolve(icyPayload('Late - Track'));
    await flush();
    expect(seen.at(-1)).toBeUndefined();
  });

  it('the first attempt is immediate, the next one gap after the settle, and never two in flight', async () => {
    await withFakeTimers(async () => {
      const station = plainStation();
      const slow = transport.deferred();
      transport.queue(slow.promise);
      service.tune(station);
      expect(transport.sources.length).toBe(1); // immediate, before any clock

      jest.advanceTimersByTime(60_000);
      await drainMicrotasks();
      expect(transport.sources.length).toBe(1); // a settled attempt starts the clock

      slow.resolve(icyPayload('First - Track'));
      await drainMicrotasks();
      jest.advanceTimersByTime(14_999);
      await drainMicrotasks();
      expect(transport.sources.length).toBe(1);

      jest.advanceTimersByTime(1);
      await drainMicrotasks();
      expect(transport.sources.length).toBe(2); // one gap later
    });
  });

  it('suspend parks the chain and keeps the value; resume restarts with an immediate attempt', async () => {
    await withFakeTimers(async () => {
      const station = plainStation();
      const seen = await readings();
      transport.queue(icyPayload('Artist - Title'));
      service.tune(station);
      await drainMicrotasks();
      expect(seen.at(-1)).toEqual({ artist: 'Artist', title: 'Title' });

      service.suspend();
      expect(transport.cancelled).toBeGreaterThan(0);
      jest.advanceTimersByTime(60_000);
      await drainMicrotasks();
      expect(transport.sources.length).toBe(1); // parked: no further attempts
      expect(seen.at(-1)).toEqual({ artist: 'Artist', title: 'Title' });

      transport.queue(icyPayload('Fresh - Track'));
      service.resume();
      expect(transport.sources.length).toBe(2); // immediate on resume
      await drainMicrotasks();
      expect(seen.at(-1)).toEqual({ artist: 'Fresh', title: 'Track' });
    });
  });

  it('resume restarts only a parked chain: a running chain is left alone, and an untuned service stays quiet', async () => {
    await withFakeTimers(async () => {
      // Nothing tuned: the gate's resume on a playing state adds no attempt.
      service.resume();
      expect(transport.sources).toEqual([]);

      // The common gesture: the hook tunes, then the state lands on playing.
      // The tune's own immediate attempt is the fresh tick; resume adds none.
      const station = plainStation();
      transport.queue(icyPayload('Artist - Title'));
      service.tune(station);
      await drainMicrotasks();

      service.resume();
      expect(transport.sources.length).toBe(1);
    });
  });

  it('a tune that follows a suspension runs on its own: the playing state that lands after adds nothing', async () => {
    await withFakeTimers(async () => {
      const station = plainStation();
      const seen = await readings();
      transport.queue(icyPayload('First - Track'));
      service.tune(station);
      await drainMicrotasks();

      service.suspend();
      transport.queue(icyPayload('Second - Track'));
      service.tune(station); // the skip re-tunes
      await drainMicrotasks();
      expect(seen.at(-1)).toEqual({ artist: 'Second', title: 'Track' });

      service.resume(); // the playing state the skip produced
      expect(transport.sources.length).toBe(2); // the re-tune's attempt, not a third
    });
  });

  it('a run of failures logs its literal line once, a success re-arms the log, and no failure publishes', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await withFakeTimers(async () => {
      const station = plainStation();
      const seen = await readings();
      transport.queue(
        icyPayload('Artist - Title'),
        undefined,
        undefined,
        icyPayload('Back - Track'),
        undefined,
      );
      service.tune(station);
      await drainMicrotasks();
      expect(seen.at(-1)).toEqual({ artist: 'Artist', title: 'Title' });

      jest.advanceTimersByTime(15_000);
      await drainMicrotasks(); // first failure: logged once, nothing published
      expect(warn).toHaveBeenCalledWith(
        'Now Playing: attempt for ' +
          station.metaData!.artist +
          ' failed; holding the last track until one succeeds.',
      );
      expect(seen.at(-1)).toEqual({ artist: 'Artist', title: 'Title' });

      jest.advanceTimersByTime(15_000);
      await drainMicrotasks(); // second failure: still one line for the run
      expect(warn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(15_000);
      await drainMicrotasks(); // a success re-arms the log
      expect(seen.at(-1)).toEqual({ artist: 'Back', title: 'Track' });

      jest.advanceTimersByTime(15_000);
      await drainMicrotasks(); // a fresh run of failures: logged once again
      expect(warn).toHaveBeenCalledTimes(2);
    });
    warn.mockRestore();
  });

  it('a re-tune tears the previous tracking down itself and always restarts', async () => {
    const plain = Stations.stations.find(
      (candidate) => !candidate.metadataParser,
    )!;
    const seen = await readings();
    transport.queue(icyPayload('First - Track'));
    service.tune(plain);
    await flush();
    expect(seen.at(-1)).toEqual({ artist: 'First', title: 'Track' });

    // No stop, just tune again: the new attempt answers.
    transport.queue(icyPayload('Second - Track'));
    service.tune(plain);
    await flush();
    expect(transport.cancelled).toBeGreaterThan(0);
    expect(seen.at(-1)).toEqual({ artist: 'Second', title: 'Track' });
  });
});
