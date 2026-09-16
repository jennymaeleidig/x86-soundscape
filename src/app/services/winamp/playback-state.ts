import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
/** The playback state, in the OS media widget's own three words. */
export type PlaybackState = 'playing' | 'paused' | 'none';
/**
 * The engine's statuses. `STOPPED`, `ENDED` and `CLOSED` all collapse into
 * `'none'` — "stopped" and "untuned" are one state, not two kept in sync, so
 * a Station is tuned iff playback is playing or paused.
 */
export type EngineStatus =
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
  status(): EngineStatus;
  subscribe(onChange: () => void): () => void;
}
/** The engine's word for a status becomes the published word for the state. */
export function toState(status: EngineStatus): PlaybackState {
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
 * The playback state as a cache over the engine: the source is subscribed to
 * once, every notification is coalesced onto a microtask boundary, and only a
 * change of value is published.
 *
 * The coalescing is load-bearing: tuning is "reopen (which reports stopped),
 * then set the tracks and play", so publishing per notification would push a
 * stop through the panel in the middle of one gesture. One publisher, every
 * reader: a late subscriber receives the current value over the same
 * subscription, and the publisher lives while any reader listens.
 */
export function playbackState$(
  source: StatusSource,
  pollMs: number = POLL_MS,
): Observable<PlaybackState> {
  return new Observable<PlaybackState>((subscriber) => {
    // The cache: seeded from the source at subscribe time, deduped by value.
    const current = new BehaviorSubject<PlaybackState>(
      toState(source.status()),
    );
    let scheduled = false;
    const read = () => {
      scheduled = false;
      const state = toState(source.status());
      if (current.value !== state) {
        current.next(state);
      }
    };
    // Coalesce: however many notifications arrive in one synchronous burst,
    // the status is read once, after them.
    const request = () => {
      if (!scheduled) {
        scheduled = true;
        queueMicrotask(read);
      }
    };
    subscriber.add(source.subscribe(request));
    subscriber.add(() => clearInterval(poll));
    const poll = setInterval(read, pollMs);
    subscriber.add(current.subscribe(subscriber));
  }).pipe(shareReplay({ bufferSize: 1, refCount: true }));
}
