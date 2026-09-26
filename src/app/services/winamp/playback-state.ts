import { Observable } from 'rxjs';
import { coalescedSource } from './coalesced-source';

/** The playback state, in the OS media widget's own three words. */
export type PlaybackState = 'playing' | 'paused' | 'none';
/**
 * The engine's statuses. `STOPPED`, `ENDED` and `CLOSED` all collapse into
 * `'none'` — "stopped" and "untuned" are one state, not two kept in sync, so
 * a Station is tuned iff playback is playing or paused.
 */
export type EnginePlaybackStatus =
  | 'PLAYING'
  | 'PAUSED'
  | 'STOPPED'
  | 'ENDED'
  | 'CLOSED';
/**
 * The engine surface the player reads the playback state from: one status
 * read and one change subscription. The engine remains the only authority on
 * whether audio runs; this is the cache's view of it.
 */
export interface StatusSource {
  status(): EnginePlaybackStatus;
  subscribe(onChange: () => void): () => void;
}
/** The engine's word for a status becomes the published word for the state. */
export function toState(status: EnginePlaybackStatus): PlaybackState {
  switch (status) {
    case 'PLAYING':
      return 'playing';
    case 'PAUSED':
      return 'paused';
    default:
      return 'none';
  }
}
/**
 * How often the fallback poll reads the status; a read is in-memory, so the
 * poll is cheap, and it exists only in case the store subscription ever
 * stops being told. Specs pass a shorter interval.
 */
const POLL_MS = 1_000;
/**
 * The playback state as a cache over the engine, through the shared coalesced
 * cache: the status is read and mapped, and the fallback poll is the extra
 * listener that keeps a silent store from freezing the state.
 */
export function playbackState$(
  source: StatusSource,
  pollMs: number = POLL_MS,
): Observable<PlaybackState> {
  return coalescedSource<PlaybackState>({
    read: () => toState(source.status()),
    subscribe: (onChange) => {
      const unsubscribe = source.subscribe(onChange);
      const poll = setInterval(onChange, pollMs);
      return () => {
        unsubscribe();
        clearInterval(poll);
      };
    },
  });
}
