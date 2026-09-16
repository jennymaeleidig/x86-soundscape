import { Injectable, inject } from '@angular/core';
import type { Station } from '../../../assets/audio/stations';
import { BehaviorSubject, Observable } from 'rxjs';
import { NowPlaying, ResolvedParser, parserFor, sourceFor } from './parsers';
import { NowPlayingTransport } from './transport';

/** How long the module rests between attempts; the transport owns no cadence. */
const POLL_INTERVAL_MS = 15_000;

/**
 * Now Playing: one module owns the whole path — the tuning, the per-kind read
 * of a payload, and the announcement. Its interface is `tune`, `stop` and
 * `nowPlaying$`; nothing outside it ever sees a raw payload.
 *
 * `undefined` means *nothing is tuned*; the Station descriptor means *tuned,
 * no track*. A payload that yields a track replaces the published value; one
 * that yields no track leaves it alone; a payload that lands after its tune
 * ended changes nothing (the generation rule).
 */
@Injectable({ providedIn: 'root' })
export class NowPlayingService {
  private readonly transport = inject(NowPlayingTransport);
  private readonly current = new BehaviorSubject<NowPlaying | undefined>(
    undefined,
  );
  readonly nowPlaying$: Observable<NowPlaying | undefined> =
    this.current.asObservable();

  /** Bumped on every tune and every stop; a stale generation's payloads drop. */
  private generation = 0;
  private pollTimer: ReturnType<typeof setTimeout> | undefined;

  /** Tears any previous tracking down itself, and always restarts. */
  tune(station: Station): void {
    this.teardown();
    const generation = ++this.generation;
    // Published immediately, for every kind: the descriptor is the reading
    // until a payload yields a track.
    this.current.next(descriptorOf(station));
    const parser = parserFor(station.metadataParser);
    if (!parser) {
      // 'none' means never polls: descriptor forever, no request.
      return;
    }
    void this.track(generation, station, parser);
  }

  stop(): void {
    this.teardown();
    ++this.generation;
    this.current.next(undefined);
  }

  private teardown(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = undefined;
    }
    this.transport.cancel();
  }

  /**
   * The cadence is a chain — attempt, settle, wait the interval, attempt — so
   * two requests are never in flight. Every step after an await re-checks the
   * generation: what the listener sees can never be about a Station they are
   * no longer tuned to.
   */
  private async track(
    generation: number,
    station: Station,
    parser: ResolvedParser,
  ): Promise<void> {
    while (generation === this.generation) {
      const raw = await this.transport.fetch(sourceFor(station, parser.kind));
      if (generation !== this.generation) {
        return;
      }
      if (raw !== undefined) {
        const track = this.read(raw, station, parser);
        if (track) {
          this.current.next(track);
        }
      }
      await this.rest();
    }
  }

  /** Wait the interval; teardown clears the timer, so the chain stops here. */
  private rest(): Promise<void> {
    return new Promise((resolve) => {
      this.pollTimer = setTimeout(resolve, POLL_INTERVAL_MS);
    });
  }

  /**
   * The adapter never throws, but a malformed payload is `undefined`, which is
   * already the nothing-arrived value; an artist the payload did not carry
   * comes from the Station descriptor.
   */
  private read(
    raw: unknown,
    station: Station,
    parser: ResolvedParser,
  ): NowPlaying | undefined {
    try {
      const track = parser.read(raw);
      if (!track) {
        return undefined;
      }
      return {
        artist: track.artist || station.metaData?.artist || '',
        title: track.title,
      };
    } catch {
      return undefined;
    }
  }
}

function descriptorOf(station: Station): NowPlaying {
  return {
    artist: station.metaData?.artist ?? '',
    title: station.metaData?.title ?? '',
  };
}
