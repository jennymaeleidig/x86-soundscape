import type { MockInstance } from 'vitest';
import { vi } from 'vitest';

/**
 * The transport-level fake: stands in for the audio element the engine builds,
 * recording every source the media stack is handed. jsdom performs no media
 * loading, so a recorded source is the one observable shape a request takes —
 * a source set before any gesture is a stream opened behind the listener's
 * back, and an empty record is the proof that none was.
 */
export class FakeMediaElement {
  /** Every source set on an audio element while installed, in order. */
  static requests: string[] = [];

  private static spy: MockInstance | undefined;

  /** Puts the recording shim behind the document's element factory. */
  static install(): void {
    FakeMediaElement.requests = [];
    const real = document.createElement.bind(document);
    FakeMediaElement.spy = vi
      .spyOn(document, 'createElement')
      .mockImplementation(((tag: string, options?: ElementCreationOptions) => {
        const element = real(tag, options);
        if (String(tag).toLowerCase() !== 'audio') {
          return element;
        }
        return recordingSource(element);
      }) as typeof document.createElement);
  }

  /** Hands the document's element factory back. */
  static restore(): void {
    FakeMediaElement.spy?.mockRestore();
    FakeMediaElement.spy = undefined;
  }
}

/**
 * An own `src` property on the element itself records every source the media
 * stack is handed: the element stays a real jsdom EventTarget (its engine
 * calls addEventListener on it, and jsdom's wrappers reject a Proxy), and the
 * own property shadows the accessor jsdom defines on the prototype.
 */
function recordingSource(element: HTMLElement): HTMLElement {
  let src = '';
  Object.defineProperty(element, 'src', {
    configurable: true,
    get(): string {
      return src;
    },
    set(value: string) {
      if (typeof value === 'string') {
        FakeMediaElement.requests.push(value);
      }
      src = value;
    },
  });
  return element;
}
