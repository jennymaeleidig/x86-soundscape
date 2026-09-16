import { Injectable } from '@angular/core';
import { ambienceSounds, type Sound } from './sounds';

const DEFAULT_VOLUME = 0.5;

@Injectable({
  providedIn: 'root',
})
export class AmbienceService {
  private currentVolume: number = DEFAULT_VOLUME;
  private currentAudio: HTMLAudioElement | null = null;
  private currentSound: Sound | null = null;
  private ambienceSounds: Sound[] = ambienceSounds;

  constructor() {}

  /**
   * Selects a random ambience sound and plays it in a loop.
   * Stops any currently playing ambience sound first.
   */
  playRandomAmbience(): void {
    this.stopAmbience(); // Stop current sound before playing a new one

    if (this.ambienceSounds.length === 0) {
      console.warn('No ambience sounds available.');
      return;
    }

    const randomIndex = Math.floor(Math.random() * this.ambienceSounds.length);
    const selectedSound = this.ambienceSounds[randomIndex];

    this.currentSound = selectedSound;
    this.currentAudio = new Audio(selectedSound.path);
    this.currentAudio.loop = true; // Set the sound to loop
    this.currentAudio.volume = this.currentVolume;

    // Handle potential errors
    this.currentAudio.onerror = (e) => {
      console.error('Error playing ambience sound:', selectedSound.path, e);
      this.stopAmbience();
    };

    this.currentAudio.play().catch((error) => {
      console.warn('Audio playback prevented:', error);
    });
    console.log('Playing ambience:', selectedSound.name);
  }

  /**
   * Stops the currently playing ambience sound and cleans up.
   */
  stopAmbience(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.currentSound = null;
  }

  playAmbience() {
    if (this.currentAudio) {
      this.currentAudio.play();
    } else {
      this.playRandomAmbience();
    }
  }

  getAmbienceName(): string {
    return this.currentSound?.name ?? 'Not Playing';
  }

  volumeUp(): void {
    if (this.currentAudio && this.currentAudio.volume < 1.0) {
      this.currentAudio.volume = Math.min(1.0, this.currentAudio.volume + 0.1);
      this.currentVolume = this.currentAudio.volume;
    }
  }

  volumeDown(): void {
    if (this.currentAudio && this.currentAudio.volume > 0.0) {
      this.currentAudio.volume = Math.max(0.0, this.currentAudio.volume - 0.1);
      this.currentVolume = this.currentAudio.volume;
    }
  }

  mute(): void {
    if (this.currentAudio) {
      this.currentAudio.volume = 0.0;
    }
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }
}
