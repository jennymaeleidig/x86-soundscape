/**
 * Lets every microtask a test scheduled land before the assertion: two task
 * hops cover the coalesced read and the publish.
 */
import { vi } from 'vitest';

export const flush = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * The timers `withFakeTimers` fakes: Vitest's default `toFake` leaves
 * `queueMicrotask` real, but the coalescing the poll chain hangs behind runs
 * on one — jest's timers faked it, and the specs' `advanceTimersByTime(0)`
 * fires the coalesced read. `nextTick` stays real; promises are never faked,
 * so `drainMicrotasks` still drains.
 */
const FAKED = [
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'setImmediate',
  'clearImmediate',
  'Date',
  'queueMicrotask',
  'performance',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'requestIdleCallback',
  'cancelIdleCallback',
];

/**
 * Run a body under vi's fake timers: the poll chain's rest timer is fake, so
 * only promises are drained inside and the spec advances the clock by hand.
 */
export async function withFakeTimers(body: () => Promise<void>): Promise<void> {
  vi.useFakeTimers({
    // A plain string[] is not FakeMethod[]; the cast keeps the array above as
    // the readable list of faked timers.
    toFake: [...FAKED] as never,
  });
  try {
    await body();
  } finally {
    vi.useRealTimers();
  }
}

/** Run the poll chain's microtasks; its timer is fake, advanced by hand. */
export const drainMicrotasks = async () => {
  for (let i = 0; i < 20; i++) {
    await Promise.resolve();
  }
};
