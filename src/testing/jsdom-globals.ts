/**
 * jsdom, as this repo's Jest environment provides it, leaves `TextDecoder` and
 * `TextEncoder` undefined, and webamp's bundle reads them the moment it is
 * imported — which happens through WinampService, imported by the Applet and
 * the Menu. Import this module before any component module and the graph
 * loads.
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
