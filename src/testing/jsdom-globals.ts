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

/**
 * A Web Audio context that builds inert nodes: webamp's media stack constructs
 * its AudioContext at engine construction, and jsdom has none. Nothing here
 * produces sound — it exists so the engine can be built, and so a spec can
 * observe what reaches the audio element rather than what the graph does.
 */
function inertAudioNode(): Record<string, unknown> {
  const node: Record<string, unknown> = {
    connect: () => node,
    disconnect: () => undefined,
    gain: { value: 1 },
    frequency: { value: 0 },
    balance: { value: 0 },
    type: '',
    fftSize: 0,
    smoothingTimeConstant: 0,
    getByteFrequencyData: () => undefined,
    getByteTimeDomainData: () => undefined,
  };
  return node;
}

class NoopAudioContext {
  state = 'running';
  currentTime = 0;
  sampleRate = 44100;
  destination = inertAudioNode();
  resume(): Promise<void> {
    return Promise.resolve();
  }
  createGain(): Record<string, unknown> {
    return inertAudioNode();
  }
  createAnalyser(): Record<string, unknown> {
    return inertAudioNode();
  }
  createBiquadFilter(): Record<string, unknown> {
    return inertAudioNode();
  }
  createStereoPanner(): Record<string, unknown> {
    return inertAudioNode();
  }
  createMediaElementSource(): Record<string, unknown> {
    return inertAudioNode();
  }
  createChannelSplitter(): Record<string, unknown> {
    return inertAudioNode();
  }
  createChannelMerger(): Record<string, unknown> {
    return inertAudioNode();
  }
}

globals['AudioContext'] ??= NoopAudioContext;
// webamp patches node wiring through the real AudioNode prototype's connect
// and disconnect, so the stub must carry them.
globals['AudioNode'] ??= class NoopAudioNode {
  connect(): unknown {
    return undefined;
  }
  disconnect(): unknown {
    return undefined;
  }
};
