/**
 * Lets every microtask a test scheduled land before the assertion: two task
 * hops cover the coalesced read and the publish.
 */
export const flush = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * Run a body under jest's fake timers: the poll chain's rest timer is jest's,
 * so only promises are drained inside and the spec advances the clock by hand.
 */
export async function withFakeTimers(body: () => Promise<void>): Promise<void> {
  jest.useFakeTimers();
  try {
    await body();
  } finally {
    jest.useRealTimers();
  }
}

/** Run the poll chain's microtasks; its timer is jest's, advanced by hand. */
export const drainMicrotasks = async () => {
  for (let i = 0; i < 20; i++) {
    await Promise.resolve();
  }
};
