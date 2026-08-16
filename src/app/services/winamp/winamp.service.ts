import { Injectable } from '@angular/core';
import Webamp from 'webamp';
import Stations, { Station } from '../../../assets/audio/stations';
import { MetadataService } from '../metadata/metadata.service';

@Injectable({
  providedIn: 'root',
})
export class WinampService {
  /**
   * Initialize webamp
   */
  webamp = new Webamp({
    initialTracks: Stations.stations,
    initialSkin: {
      url: 'assets/skins/classic_mac_v1.wsz',
    },
    availableSkins: [{ url: 'assets/skins/Old_Mac-OS.wsz', name: 'MacOS' }],
    zIndex: 15,
    enableMediaSession: true,
  });
  rootElement!: HTMLElement;

  /**
   * Initialize MetadataService
   */
  unsubFromTrackChange = this.webamp.onTrackDidChange((track) => {
    if (track) {
      const station: Station | undefined = Stations.stations.find(
        (station: Station) => station.url === track.url,
      );
      if (station) {
        this.metadataService.stop();
        this.metadataService.start(station, (metadata: any) => {
          this.metadataService.announceTrackUpdate(metadata);
        });
      } else {
        this.metadataService.stop();
      }
    } else {
      this.metadataService.stop();
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
    this.webamp.renderInto(this.rootElement);
  }

  closeWinamp() {
    this.webamp.close();
  }

  reopenWinamp() {
    this.webamp.reopen();
  }

  playRadio() {
    this.webamp.reopen();
    this.webamp.setTracksToPlay(Stations.stations);
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
