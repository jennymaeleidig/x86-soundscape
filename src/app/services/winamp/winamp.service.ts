import { Injectable } from '@angular/core';
import Webamp from 'webamp';
import Songs, { TrackWithMeta } from '../../../assets/audio/songs';
import { MetadataService } from '../metadata/metadata.service';

@Injectable({
  providedIn: 'root',
})
export class WinampService {
  /**
   * Initialize webamp
   */
  webamp = new Webamp({
    initialTracks: Songs.songs,
    initialSkin: {
      url: 'assets/skins/classic_mac_v1.wsz',
    },
    availableSkins: [{ url: 'assets/skins/Old_Mac-OS.wsz', name: 'MacOS' }],
    zIndex: 15,
  });
  rootElement!: HTMLElement;

  /**
   * Initialize MetadataService
   */
  unsubFromTrackChange = this.webamp.onTrackDidChange((track) => {
    if (track) {
      const trackWithMeta: TrackWithMeta | undefined = Songs.songs.find(
        (trackWithMeta: TrackWithMeta) => trackWithMeta.url === track.url,
      );
      if (trackWithMeta) {
        console.log(trackWithMeta.metadataSource);
      }
    }
  });

  constructor(private metadataService: MetadataService) {}

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

  play() {
    this.webamp.play();
  }

  pause() {
    this.webamp.pause();
  }

  prev() {
    this.webamp.previousTrack();
  }

  stop() {
    this.webamp.stop();
  }

  next() {
    this.webamp.nextTrack();
  }
}
