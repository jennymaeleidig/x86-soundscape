/**
 * Globals this repo's jsdom leaves out, supplied for the components under test.
 * Import this module before any component module: two of them need these at the
 * moment they load or render.
 *
 * - `TextDecoder` and `TextEncoder`: webamp's bundle reads them at import time,
 *   and the Applet and the Menu import WinampService.
 * - `IntersectionObserver`: the marquee in the Menu starts one once its view is
 *   up, and jsdom has none.
 *
 * The order is the whole point, so this file stays a side effect: ESM evaluates
 * imports in the order they are declared.
 */
const util = jest.requireActual('util') as {
  TextDecoder: unknown;
  TextEncoder: unknown;
};

const globals = globalThis as Record<string, unknown>;
globals['TextDecoder'] ??= util.TextDecoder;
globals['TextEncoder'] ??= util.TextEncoder;

class NoopIntersectionObserver {
  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds: number[] = [];

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

globals['IntersectionObserver'] ??= NoopIntersectionObserver;
