import { Injectable } from '@angular/core';
import { ambienceSoundPaths } from '../../../assets/audio/ambience-sounds';

const DEFAULT_VOLUME = 0.5;

@Injectable({
  providedIn: 'root',
})
export class AmbienceService {
  private currentAudio: HTMLAudioElement | null = null;
  private ambienceSounds: string[] = ambienceSoundPaths;

  constructor() {}

  /**
   * Selects a random ambience sound and plays it in a loop.
   * Stops any currently playing ambience sound first.
   */
  playRandomAmbience(): void {
    this.stopAmbience(); // Stop current sound before playing a new one

    if (this.ambienceSounds.length === 0) {
      console.warn('No ambience sound paths available.');
      return;
    }

    const randomIndex = Math.floor(Math.random() * this.ambienceSounds.length);
    const selectedSoundPath = this.ambienceSounds[randomIndex];

    this.currentAudio = new Audio(selectedSoundPath);
    this.currentAudio.loop = true; // Set the sound to loop
    this.currentAudio.volume = DEFAULT_VOLUME;

    // Handle potential errors
    this.currentAudio.onerror = (e) => {
      console.error('Error playing ambience sound:', selectedSoundPath, e);
      this.stopAmbience();
    };

    this.currentAudio.play().catch((error) => {
      console.warn('Audio playback prevented:', error);
    });
    console.log('Playing ambience:', selectedSoundPath);
  }

  /**
   * Stops the currently playing ambience sound and cleans up.
   */
  stopAmbience(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      console.log('Ambience stopped.');
    }
  }

  getAmbienceName(): string {
    if (this.currentAudio) {
      return this.currentAudio.src.split('/').pop() || 'Unknown';
    } else {
      return 'Not Playing';
    }
  }
}
