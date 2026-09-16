import { HttpNowPlayingTransport } from './transport';
import type IcecastMetadataStats from 'icecast-metadata-stats';

/**
 * The library double: a read that never settles on its own, so only the
 * deadline, `stop()`, or the spec can end an attempt.
 */
class FakeLibrary {
  stopped = false;
  readonly reads: Promise<unknown>[] = [];
  private settle!: (value: unknown) => void;
  private reject!: (reason?: unknown) => void;

  constructor(
    readonly endpoint: string,
    readonly options: { sources?: string[] },
  ) {}

  fetch(): Promise<unknown> {
    const read = new Promise<unknown>((resolved, rejected) => {
      this.settle = resolved;
      this.reject = rejected;
    });
    this.reads.push(read);
    return read;
  }

  resolveRead(value: unknown): void {
    this.settle(value);
  }

  stop(): void {
    this.stopped = true;
    this.reject?.(new Error('stopped'));
  }
}

/** The transport under test, whose library factory hands back the double. */
class TestableTransport extends HttpNowPlayingTransport {
  readonly libraries: FakeLibrary[] = [];

  protected override createLibrary(
    url: string,
    options: { sources?: string[] },
  ): IcecastMetadataStats {
    const library = new FakeLibrary(url, options);
    this.libraries.push(library);
    return library as unknown as IcecastMetadataStats;
  }
}

describe('HttpNowPlayingTransport', () => {
  let transport: TestableTransport;

  beforeEach(() => {
    jest.useFakeTimers();
    transport = new TestableTransport();
  });

  const originalFetch = globalThis.fetch;

  afterEach(() => {
    jest.useRealTimers();
    if (originalFetch === undefined) {
      delete (globalThis as { fetch?: unknown }).fetch;
    } else {
      globalThis.fetch = originalFetch;
    }
  });

  /** jsdom has no global fetch; the transport reads it off globalThis. */
  const useFetch = (mock: jest.Mock) => {
    (globalThis as { fetch?: unknown }).fetch = mock;
    return mock;
  };

  it('settles our own fetch by its deadline, reporting a failed attempt rather than rejecting', async () => {
    const fetchMock = useFetch(
      jest.fn().mockImplementation(
        (_url: string, init?: { signal?: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(new Error('aborted')),
            );
          }),
      ),
    );

    const attempt = transport.fetch({
      via: 'fetch',
      endpoint: 'https://radio.example/api/nowplaying/isekoi',
    });
    const settled = jest.fn();
    attempt.then(settled);

    jest.advanceTimersByTime(9_999);
    expect(settled).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    await attempt;
    expect(settled).toHaveBeenCalledWith(undefined);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reads azuracast JSON when the response is good, and nothing when it is not', async () => {
    useFetch(
      jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ now_playing: {} }),
      } as unknown as Response),
    );
    await expect(
      transport.fetch({ via: 'fetch', endpoint: 'https://x/api/nowplaying/a' }),
    ).resolves.toEqual({ now_playing: {} });

    useFetch(
      jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      } as unknown as Response),
    );
    await expect(
      transport.fetch({ via: 'fetch', endpoint: 'https://x/api/nowplaying/a' }),
    ).resolves.toBeUndefined();
  });

  it('gives the library one read, stops the instance at the deadline, and resolves undefined because the read may never settle', async () => {
    const attempt = transport.fetch({
      via: 'library',
      url: 'https://ice.example/stream',
      source: 'icestats',
    });
    const settled = jest.fn();
    attempt.then(settled);

    const [listener] = transport.libraries;
    expect(listener.endpoint).toBe('https://ice.example/stream');
    expect(listener.options.sources).toEqual(['icestats']);
    expect(listener.reads).toHaveLength(1);

    jest.advanceTimersByTime(10_000);
    await attempt;
    expect(settled).toHaveBeenCalledWith(undefined);
    expect(listener.stopped).toBe(true);
  });

  it('cancel releases the socket: the fetch aborts and the library instance stops', async () => {
    useFetch(
      jest.fn().mockImplementation(
        (_url: string, init?: { signal?: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(new Error('aborted')),
            );
          }),
      ),
    );

    const ours = transport.fetch({
      via: 'fetch',
      endpoint: 'https://x/api/nowplaying/a',
    });
    const theirs = transport.fetch({
      via: 'library',
      url: 'https://ice.example/stream',
      source: 'icy',
    });

    transport.cancel();
    await expect(ours).resolves.toBeUndefined();
    await expect(theirs).resolves.toBeUndefined();
    expect(transport.libraries[0].stopped).toBe(true);
  });
});
