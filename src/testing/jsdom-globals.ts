/**
 * Globals this repo's jsdom leaves out, supplied for the components under test.
 *
 * - `TextDecoder` and `TextEncoder`: webamp's bundle reads them at import time,
 *   and the Applet and the Menu import WinampService.
 * - `IntersectionObserver`: the marquee in the Menu starts one once its view is
 *   up, and jsdom has none.
 *
 * This file is the test target's polyfill (`angular.json`), so it runs before
 * any spec module. A side-effect import at the top of a spec cannot be relied
 * on to do the same: when the whole suite builds at once the bundler's shared
 * chunks reorder one spec's imports ahead of another's, and webamp then loads
 * before the shim.
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
