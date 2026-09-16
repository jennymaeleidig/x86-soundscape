/**
 * Lets every microtask a test scheduled land before the assertion: two task
 * hops cover the coalesced read and the publish.
 */
export const flush = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 0));
