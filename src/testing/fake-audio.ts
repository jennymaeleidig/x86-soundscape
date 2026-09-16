/**
 * Stands in for the audio element AmbienceService builds: jsdom has no media
 * playback, and the module is a property — not a promise — because it derives
 * the element from its state rather than reading it back.
 */
export class FakeAudio {
  static built: FakeAudio[] = [];
  static refusePlay = false;

  private static real: unknown;

  /** Puts the fake behind the Audio the module reaches for. */
  static install(): void {
    FakeAudio.built = [];
    FakeAudio.refusePlay = false;
    const audio = globalThis as unknown as { Audio: unknown };
    FakeAudio.real = audio.Audio;
    audio.Audio = FakeAudio;
  }

  static restore(): void {
    (globalThis as unknown as { Audio: unknown }).Audio = FakeAudio.real;
  }

  /** The element the module built last. */
  static get last(): FakeAudio {
    return FakeAudio.built[FakeAudio.built.length - 1];
  }

  readonly src: string;
  loop = false;
  volume = 1;
  currentTime = 0;
  paused = true;
  playCount = 0;
  onerror: (() => void) | null = null;
  readonly pause = jest.fn(() => {
    this.paused = true;
  });

  constructor(src: string) {
    this.src = src;
    FakeAudio.built.push(this);
  }

  play(): Promise<void> {
    this.playCount += 1;
    if (FakeAudio.refusePlay) {
      return Promise.reject(new Error('playback refused'));
    }
    this.paused = false;
    return Promise.resolve();
  }
}

/** Lets a settled play() rejection reach the module's handler. */
export const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
