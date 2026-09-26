import { BehaviorSubject, Observable, shareReplay } from 'rxjs';

/**
 * An engine surface read as a cache: one read of the current value and one
 * change subscription. The engine stays the only authority; this is the
 * cache's view of it.
 */
export interface CoalescedSource<T> {
  read(): T;
  subscribe(onChange: () => void): () => void;
  /** Value equality; defaults to identity. */
  same?(a: T, b: T): boolean;
}

/**
 * The cache over an engine source: the source is subscribed to once, every
 * notification is coalesced onto a microtask boundary, and only a change of
 * value is published.
 *
 * The coalescing is load-bearing: a gesture that notifies the engine several
 * times synchronously — reopen (which reports stopped), then set the tracks
 * and play — becomes one published change rather than a stop through the
 * middle of the gesture. One publisher, every reader: a late subscriber
 * receives the current value over the same subscription, and the publisher
 * lives while any reader listens.
 */
export function coalescedSource<T>(source: CoalescedSource<T>): Observable<T> {
  return new Observable<T>((subscriber) => {
    const same = source.same ?? Object.is;
    const current = new BehaviorSubject<T>(source.read());
    let scheduled = false;
    const read = () => {
      scheduled = false;
      const next = source.read();
      if (!same(current.value, next)) {
        current.next(next);
      }
    };
    // Coalesce: however many notifications arrive in one synchronous burst,
    // the source is read once, after them.
    const request = () => {
      if (!scheduled) {
        scheduled = true;
        queueMicrotask(read);
      }
    };
    subscriber.add(source.subscribe(request));
    subscriber.add(current.subscribe(subscriber));
  }).pipe(shareReplay({ bufferSize: 1, refCount: true }));
}
