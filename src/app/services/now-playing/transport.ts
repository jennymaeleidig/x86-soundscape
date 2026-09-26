import { Injectable } from '@angular/core';
import IcecastMetadataStats from 'icecast-metadata-stats';
import type { Station } from '../../data/stations';

/** Where one attempt reads from: the dependency's own read, or our own fetch. */
export type NowPlayingSource =
  | { via: 'library'; url: string; source: string }
  | { via: 'fetch'; endpoint: string };

/** The source one attempt reads, built from the Station and its parser kind. */
export function sourceFor(
  station: Station,
  kind: 'icy' | 'icestats' | 'azuracast',
): NowPlayingSource {
  const parser = station.metadataParser;
  if (parser?.kind === 'azuracast') {
    return {
      via: 'fetch',
      endpoint: `${originOf(station.url)}/api/nowplaying/${parser.shortcode}`,
    };
  }
  return { via: 'library', url: station.url, source: kind };
}

function originOf(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return '';
  }
}

/**
 * The transport seam beneath Now Playing: one attempt per call, no timer, no
 * cadence and no failure policy of its own — the module owns all three. The
 * promise settles by the deadline whatever the underlying read does, and a
 * deadline expiry is reported as a failed attempt (`undefined`) rather than a
 * rejection the module has to interpret.
 */
export abstract class NowPlayingTransport {
  /** One attempt. `undefined` is a failed or empty attempt, not a value. */
  abstract fetch(source: NowPlayingSource): Promise<unknown | undefined>;
  /** Releases the socket now, when the tune changes or stops. */
  abstract cancel(): void;
}
/** How long one attempt may take; the library has no deadline of its own. */
const DEADLINE_MS = 10_000;

@Injectable({ providedIn: 'root' })
export class HttpNowPlayingTransport extends NowPlayingTransport {
  private controller: AbortController | undefined;
  private library: IcecastMetadataStats | undefined;

  /** The seam a spec replaces: which library instance one read uses. */
  protected createLibrary(
    url: string,
    options: { sources?: string[] },
  ): IcecastMetadataStats {
    return new IcecastMetadataStats(url, options);
  }

  async fetch(source: NowPlayingSource): Promise<unknown | undefined> {
    return source.via === 'fetch'
      ? this.fetchJson(source.endpoint)
      : this.fetchLibrary(source);
  }

  cancel(): void {
    this.controller?.abort();
    this.controller = undefined;
    this.library?.stop();
    this.library = undefined;
  }

  /** Our own request, aborted with a signal at the deadline. */
  private async fetchJson(endpoint: string): Promise<unknown | undefined> {
    const controller = new AbortController();
    this.controller = controller;
    const deadline = setTimeout(() => controller.abort(), DEADLINE_MS);
    try {
      const response = await fetch(endpoint, { signal: controller.signal });
      return response.ok ? await response.json() : undefined;
    } catch {
      return undefined;
    } finally {
      clearTimeout(deadline);
      if (this.controller === controller) {
        this.controller = undefined;
      }
    }
  }

  /**
   * The dependency's own read: one instance, one read, then the instance's own
   * `stop()` — its `start()` is never called, so its interval and its state
   * check are never armed. The library's agreement to abort is not an
   * agreement to settle, so the deadline resolves `undefined` itself.
   */
  private fetchLibrary(source: {
    url: string;
    source: string;
  }): Promise<unknown | undefined> {
    const library = this.createLibrary(source.url, {
      sources: [source.source],
    });
    this.library = library;
    return new Promise((resolve) => {
      const deadline = setTimeout(() => {
        library.stop();
        resolve(undefined);
      }, DEADLINE_MS);
      library
        .fetch()
        .then(
          (stats) => resolve(stats),
          () => resolve(undefined),
        )
        .finally(() => {
          // One instance, one read, then the instance's own stop() — whatever
          // the read did, nothing of it outlives the attempt.
          clearTimeout(deadline);
          library.stop();
          if (this.library === library) {
            this.library = undefined;
          }
        });
    });
  }
}
