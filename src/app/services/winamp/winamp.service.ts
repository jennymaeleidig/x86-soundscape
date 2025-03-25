import { Injectable } from '@angular/core';
import Webamp from 'webamp';
import Songs from '../../../assets/audio/songs';

@Injectable({
  providedIn: 'root',
})
export class WinampService {
  webamp = new Webamp({
    initialTracks: Songs.songs,
    initialSkin: {
      url: 'assets/skins/Old_Mac-OS.wsz',
    },
    availableSkins: [{ url: 'assets/skins/Old_Mac-OS.wsz', name: 'MacOS' }],
  });
  rootElement!: HTMLElement;

  constructor() {}

  /**
   * Must be called before renderWebamp().
   */
  setWinampRootElement(elem: HTMLElement) {
    this.rootElement = elem;
  }

  renderWinamp() {
    this.webamp.renderWhenReady(this.rootElement);
  }

  closeWinamp() {
    this.webamp.close();
  }

  reopenWinamp() {
    this.webamp.reopen();
  }

  playRadio() {
    this.webamp.reopen();
    this.webamp.setTracksToPlay(Songs.songs);
    this.webamp.play();
  }
}
