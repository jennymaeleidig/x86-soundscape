import {
  NowPlayingSource,
  NowPlayingTransport,
} from '../app/services/now-playing/transport';

/**
 * The transport double specs hand Now Playing: each queued answer is handed
 * out in turn, and a pending answer can be resolved by hand, so a payload can
 * be made to land after its tune ended.
 */
export class FakeTransport extends NowPlayingTransport {
  sources: NowPlayingSource[] = [];
  cancelled = 0;
  private answers: Promise<unknown | undefined>[] = [];

  queue(...answers: (unknown | undefined)[] | Promise<unknown | undefined>[]) {
    this.answers.push(
      ...answers.map((answer) =>
        answer instanceof Promise ? answer : Promise.resolve(answer),
      ),
    );
  }

  /** An answer the spec resolves by hand, so a payload can land late. */
  deferred(): {
    promise: Promise<unknown | undefined>;
    resolve: (value: unknown) => void;
  } {
    let resolve!: (value: unknown) => void;
    return {
      promise: new Promise((settled) => (resolve = settled)),
      resolve,
    };
  }

  fetch(source: NowPlayingSource): Promise<unknown | undefined> {
    this.sources.push(source);
    return this.answers.shift() ?? Promise.resolve(undefined);
  }

  cancel(): void {
    this.cancelled++;
  }
}
