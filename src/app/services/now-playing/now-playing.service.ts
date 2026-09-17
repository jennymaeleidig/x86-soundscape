import { Injectable, inject } from '@angular/core';
import type { Station } from '../../../assets/audio/stations';
import { BehaviorSubject, Observable } from 'rxjs';
import { NowPlaying, ResolvedParser, parserFor } from './parsers';
import { NowPlayingTransport, sourceFor } from './transport';

/** How long the module rests between attempts; the transport owns no cadence. */
const POLL_INTERVAL_MS = 15_000;

/** What one run of the chain tracks: the Station and its resolved parser. */
interface Run {
  station: Station;
  parser: ResolvedParser;
}

/**
 * Now Playing: one module owns the whole path — the tuning, the per-kind read
 * of a payload, and the announcement. Its interface is `tune`, `stop`,
 * `suspend`, `resume` and `nowPlaying$`; nothing outside it ever sees a raw
 * payload.
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

  /** Bumped on every tune, stop, suspend and resume; stale payloads drop. */
  private generation = 0;
  private pollTimer: ReturnType<typeof setTimeout> | undefined;
  private wake: (() => void) | undefined;
  /**
   * The live chain: what it polls, and whether it is parked. No chain is
   * `undefined` — there is nothing to park, and a parked chain is never
   * restarted by anything but resume.
   */
  private chain: { run: Run; parked: boolean } | undefined;
  /** Whether the current run's attempts have been failing, for the one log. */
  private failing = false;

  /** Tears any previous tracking down itself, and always restarts. */
  tune(station: Station): void {
    this.teardown();
    this.chain = undefined; // whatever replaces it runs, parked or not
    const generation = ++this.generation;
    // Published immediately, for every kind: the descriptor is the reading
    // until a payload yields a track.
    this.current.next(descriptorOf(station));
    const parser = parserFor(station.metadataParser);
    if (!parser) {
      // 'none' means never polls: descriptor forever, no request.
      this.endRun();
      return;
    }
    this.chain = { run: { station, parser }, parked: false };
    this.failing = false;
    void this.track(generation, station, parser);
  }

  stop(): void {
    this.endRun();
    this.chain = undefined; // a stopped tune is not resumed
    this.current.next(undefined);
  }

  /**
   * Parks the chain: no more attempts, last published value stands. Nothing
   * tuned holds no chain, and there is nothing to park.
   */
  suspend(): void {
    if (!this.chain) {
      return;
    }
    this.endRun();
    this.chain.parked = true;
  }

  /**
   * Restarts a parked tune with an immediate attempt, so nothing is stale
   * at the moment it matters. A chain that is running is left alone: in the
   * common gesture the hook tunes and the state lands on playing right after,
   * and the fresh tune's own immediate attempt is the fresh tick — a restart
   * here would cancel it and send a duplicate request.
   */
  resume(): void {
    const { chain } = this;
    if (!chain || !chain.parked) {
      return;
    }
    const generation = this.endRun();
    chain.parked = false;
    void this.track(generation, chain.run.station, chain.run.parser);
  }

  /**
   * Ends the current run: releases the socket, wakes the waiting chain (which
   * then sees its generation is stale and ends), and starts a fresh run so
   * the failure log re-arms. What the chain polls is kept — a suspended tune
   * resumes — unless the caller clears it. Returns the new run's generation.
   */
  private endRun(): number {
    this.teardown();
    this.failing = false;
    return ++this.generation;
  }

  private teardown(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = undefined;
    }
    // The waiting chain wakes, sees its generation is stale, and ends.
    this.wake?.();
    this.wake = undefined;
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
      // A failure is one shape and not a value: a rejection, a deadline
      // expiry or an empty read all arrive as `undefined`, and none of them
      // publishes — the last known track stands. A payload that did arrive
      // counts as a success and re-arms the log, even if it carries no track.
      if (raw !== undefined) {
        this.failing = false;
        const track = this.read(raw, station, parser);
        if (track) {
          this.current.next(track);
        }
      } else if (!this.failing) {
        this.failing = true;
        console.warn(failureLine(station));
      }
      await this.rest();
    }
  }

  /** Wait the interval; teardown wakes the chain, which then ends. */
  private rest(): Promise<void> {
    return new Promise((resolve) => {
      this.wake = resolve;
      this.pollTimer = setTimeout(() => {
        this.wake = undefined;
        resolve();
      }, POLL_INTERVAL_MS);
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

/** The Station's display name: its descriptor's artist, else its URL. */
function stationName(station: Station): string {
  return station.metaData?.artist || station.url;
}

function descriptorOf(station: Station): NowPlaying {
  return {
    artist: station.metaData?.artist ?? '',
    title: station.metaData?.title ?? '',
  };
}

/**
 * The run's first failure logs once, then the chain stays silent until a
 * success re-arms the log — a dead Station over an eight-hour session is
 * thousands of lines otherwise. The error shape the module receives is a
 * bare `undefined` (every rejection and deadline collapses to it), so the
 * line names the Station and the holding, not an error it was never given.
 */
function failureLine(station: Station): string {
  return `Now Playing: attempt for ${stationName(station)} failed; holding the last track until one succeeds.`;
}
