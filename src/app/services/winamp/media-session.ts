import { InjectionToken } from '@angular/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import type { NowPlaying } from '../now-playing/parsers';
import type { PlaybackState } from './playback-state';

/**
 * The Media Session — the browser's OS media widget — as far as the adapter
 * reaches: the two properties it writes and the action handlers it installs.
 * The types come straight from the platform, so a misspelled action or a
 * seek handler would not compile.
 */
export type MediaSessionSurface = Pick<
  MediaSession,
  'playbackState' | 'metadata' | 'setActionHandler'
>;

/**
 * The player's transport commands, as the widget's buttons perform them. The
 * commands are the guarded ones — `ensure` decided, never the engine's own
 * toggling verbs — so a second press of the OS pause cannot resume.
 */
export interface MediaCommands {
  play(): void;
  pause(): void;
  prev(): void;
  next(): void;
}

/**
 * The browser's Media Session, or nothing: a browser without the API has no
 * widget to write to, and the adapter stands down rather than throws.
 */
export const MEDIA_SESSION = new InjectionToken<
  MediaSessionSurface | undefined
>('os media session', {
  providedIn: 'root',
  factory: () =>
    'mediaSession' in navigator ? navigator.mediaSession : undefined,
});

/**
 * The one writer of the Media Session's properties. It follows the player's
 * two published wires — Now Playing and the playback state — and maps them:
 * playing and paused both carry the current reading (a tuned Station is at
 * least its descriptor, so the widget shows the Station and never an
 * Ambience sound, which publishes nothing here), and none clears the
 * metadata. With no session — a browser without the API — it does nothing:
 * no handlers, no subscription.
 */
export function wireMediaSession(
  nowPlaying$: Observable<NowPlaying | undefined>,
  playbackState$: Observable<PlaybackState>,
  commands: MediaCommands,
  session?: MediaSessionSurface,
): { unsubscribe(): void } {
  if (!session) {
    return { unsubscribe: () => undefined };
  }
  const handlers: [MediaSessionAction, () => void][] = [
    ['play', () => commands.play()],
    ['pause', () => commands.pause()],
    ['previoustrack', () => commands.prev()],
    ['nexttrack', () => commands.next()],
  ];
  for (const [action, handler] of handlers) {
    session.setActionHandler(action, handler);
  }
  const subscription: Subscription = combineLatest([
    nowPlaying$,
    playbackState$,
  ]).subscribe(([reading, state]) => {
    session.playbackState = state;
    session.metadata =
      state === 'none' || !reading ? null : metadataOf(reading);
  });
  return {
    unsubscribe: () => {
      subscription.unsubscribe();
      for (const [action] of handlers) {
        session.setActionHandler(action, null);
      }
    },
  };
}

/** The widget's metadata for a reading: the track's own artist and title. */
function metadataOf(reading: NowPlaying): MediaMetadata {
  const fields = { title: reading.title, artist: reading.artist };
  if (typeof MediaMetadata === 'function') {
    return new MediaMetadata(fields);
  }
  // Environments without the constructor (tests) still get the shape.
  return fields as unknown as MediaMetadata;
}
