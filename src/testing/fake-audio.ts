/**
 * Stands in for the audio element AmbienceService builds: jsdom has no media
 * playback, and the module is a property — not a promise — because it derives
 * the element from its state rather than reading it back.
 */
import { vi } from 'vitest';

export class FakeAudio {
  static built: FakeAudio[] = [];
  static refusePlay = false;

  private static real: unknown;

  /** Puts the fake behind the Audio the module reaches for. */
  static install(): void {
    FakeAudio.built = [];
    FakeAudio.refusePlay = false;
    // SAFETY: webamp installs itself on the global Audio; the fake swaps it at runtime.
    const audio = globalThis as unknown as { Audio: unknown };
    FakeAudio.real = audio.Audio;
    audio.Audio = FakeAudio;
  }

  static restore(): void {
    // SAFETY: install recorded the real constructor before replacing it.
    (globalThis as unknown as { Audio: unknown }).Audio = FakeAudio.real;
  }

  /** The element the module built last. */
  static get last(): FakeAudio {
    const last = FakeAudio.built.at(-1);
    if (!last) {
      throw new Error('No FakeAudio has been built');
    }
    return last;
  }

  readonly src: string;
  loop = false;
  volume = 1;
  currentTime = 0;
  paused = true;
  playCount = 0;
  onerror: (() => void) | null = null;
  readonly pause = vi.fn(() => {
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
