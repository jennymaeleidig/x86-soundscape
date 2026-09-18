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

  private static real: typeof document.createElement | undefined;
  private static spy: jest.SpyInstance | undefined;

  /** Puts the recording shim behind the document's element factory. */
  static install(): void {
    FakeMediaElement.requests = [];
    FakeMediaElement.real = document.createElement.bind(document);
    FakeMediaElement.spy = jest
      .spyOn(document, 'createElement')
      .mockImplementation(((tag: string, options?: ElementCreationOptions) => {
        const element = FakeMediaElement.real!(tag, options);
        if (String(tag).toLowerCase() !== 'audio') {
          return element;
        }
        return new Proxy(element, {
          set(target, property, value) {
            if (property === 'src' && typeof value === 'string') {
              FakeMediaElement.requests.push(value);
            }
            return Reflect.set(target, property, value);
          },
        });
      }) as typeof document.createElement);
  }

  /** Hands the document's element factory back. */
  static restore(): void {
    FakeMediaElement.spy?.mockRestore();
    FakeMediaElement.spy = undefined;
  }
}
