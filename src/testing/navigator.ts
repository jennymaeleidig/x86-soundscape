/**
 * Swaps the whole `navigator` property — jsdom defines it as an accessor, so
 * plain assignment does not take — runs the callback, then restores it.
 * Specs use it to stand a double in where real browser globals are read.
 */
export function withNavigator(value: unknown, run: () => void): void {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value,
  });
  try {
    run();
  } finally {
    if (original) {
      Object.defineProperty(globalThis, 'navigator', original);
    } else {
      delete (globalThis as Record<string, unknown>)['navigator'];
    }
  }
}
