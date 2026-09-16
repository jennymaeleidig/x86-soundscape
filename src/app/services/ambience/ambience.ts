import { Injectable, signal } from '@angular/core';
import { ambienceSounds, type Sound } from './sounds';

/** The listener's level never reaches zero: mute is the only silence. */
const MIN_VOLUME = 0.1;
const MAX_VOLUME = 1.0;
const VOLUME_STEP = 0.1;
const DEFAULT_VOLUME = 0.5;

/**
 * Everything the module is: the Sound it holds, the listener's level, the mute
 * flag and whether playback is running. The audio element holds none of it —
 * it outlives neither the flag nor a level set while nothing plays.
 */
export interface AmbienceState {
  sound: Sound | null;
  volume: number;
  muted: boolean;
  playing: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AmbienceService {
  private readonly sounds: Sound[] = ambienceSounds;
  private readonly currentState = signal<AmbienceState>({
    sound: null,
    volume: DEFAULT_VOLUME,
    muted: false,
    playing: false,
  });

  /** The one value the Applet and the Menu read. */
  readonly state = this.currentState.asReadonly();

  /** The element, built from the state at one place and never handed out. */
  private element: HTMLAudioElement | null = null;

  /** Resume the held Sound; a random one if none is held. */
  play(): void {
    const { sound } = this.currentState();
    if (sound) {
      this.start(sound);
    } else {
      this.shuffle();
    }
  }

  /** Halt and release the element; keep the held Sound. */
  stop(): void {
    this.releaseElement();
    this.publish({ playing: false });
  }

  /** Pick a new random Sound and play it — the only thing that replaces the held one. */
  shuffle(): void {
    if (this.sounds.length === 0) {
      console.warn('No ambience sounds available.');
      this.releaseElement();
      this.publish({ sound: null, playing: false });
      return;
    }

    this.start(this.sounds[Math.floor(Math.random() * this.sounds.length)]);
  }

  /** Audible → mute; silent → clear the mute and make sure playback is running. */
  toggle(): void {
    const { muted, playing, sound } = this.currentState();
    if (!muted && playing) {
      this.publish({ muted: true });
      return;
    }

    this.publish({ muted: false });
    if (!playing) {
      if (sound) {
        this.start(sound);
      } else {
        this.shuffle();
      }
    }
  }

  /** Clear the mute and raise one step: louder always produces sound. */
  volumeUp(): void {
    this.publish({
      volume: this.stepped(this.currentState().volume + VOLUME_STEP),
      muted: false,
    });
  }

  /** Lower one step, floor 0.10 — mute is the only silence, so this never mutes. */
  volumeDown(): void {
    this.publish({
      volume: this.stepped(this.currentState().volume - VOLUME_STEP),
    });
  }

  /** One play path, so a refusal is caught wherever playback begins. */
  private start(sound: Sound): void {
    this.releaseElement();

    const element = new Audio(sound.path);
    element.loop = true;
    this.element = element;
    this.publish({ sound, playing: true });

    // A refused load or play leaves the Sound held and playback stopped.
    element.onerror = () => {
      if (this.element !== element) {
        return;
      }
      this.releaseElement();
      this.publish({ playing: false });
    };
    element.play().catch(() => {
      if (this.element === element) {
        this.publish({ playing: false });
      }
    });
  }

  private releaseElement(): void {
    if (!this.element) {
      return;
    }
    this.element.pause();
    this.element.currentTime = 0;
    this.element = null;
  }

  private stepped(volume: number): number {
    const step = Math.round(volume * 100) / 100;
    return Math.min(MAX_VOLUME, Math.max(MIN_VOLUME, step));
  }

  /** The state is the truth: the element's volume is derived here and nowhere else. */
  private publish(patch: Partial<AmbienceState>): void {
    const next = { ...this.currentState(), ...patch };
    this.currentState.set(next);
    if (this.element) {
      this.element.volume = next.muted ? 0 : next.volume;
    }
  }
}
