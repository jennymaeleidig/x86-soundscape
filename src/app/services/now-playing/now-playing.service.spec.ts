import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import Stations from '../../../assets/audio/stations';
import { NowPlayingService } from './now-playing.service';
import { NowPlayingSource } from './parsers';
import { NowPlayingTransport } from './transport';

/**
 * The transport doubles the spec hands responses to: each queued answer is
 * handed out in turn, and a pending answer can be resolved by hand, so a
 * payload can be made to land after its tune ended.
 */
class FakeTransport extends NowPlayingTransport {
  sources: NowPlayingSource[] = [];
  cancelled = 0;
  private answers: Promise<unknown | undefined>[] = [];

  queue(...answers: (unknown | undefined)[] | Promise<unknown | undefined>[]) {
    this.answers.push(
      ...answers.map((answer) =>
        answer instanceof Promise ? answer : Promise.resolve(answer),
      ),
    );
  }

  /** An answer the spec resolves by hand, so a payload can land late. */
  deferred(): {
    promise: Promise<unknown | undefined>;
    resolve: (value: unknown) => void;
  } {
    let resolve!: (value: unknown) => void;
    return {
      promise: new Promise((settled) => (resolve = settled)),
      resolve,
    };
  }

  fetch(source: NowPlayingSource): Promise<unknown | undefined> {
    this.sources.push(source);
    return this.answers.shift() ?? Promise.resolve(undefined);
  }

  cancel(): void {
    this.cancelled++;
  }
}

const icyPayload = (streamTitle: string) => ({
  icy: { StreamTitle: streamTitle },
});
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
  async function readings(): Promise<(object | undefined)[]> {
    const seen: (object | undefined)[] = [];
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

  /** Let the attempt's promise, and the chain reading it, run to the end. */
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

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
