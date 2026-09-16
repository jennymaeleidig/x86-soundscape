import { Injectable } from '@angular/core';
import Webamp from 'webamp';
import Stations, { Station } from '../../../assets/audio/stations';
import { NowPlayingService } from '../now-playing/now-playing.service';

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
   * Tune Now Playing to the Station a track plays, and stop it when playback
   * holds no Station; `tune` tears the previous tracking down itself.
   */
  unsubFromTrackChange = this.webamp.onTrackDidChange((track) => {
    const station = track
      ? Stations.stations.find((station: Station) => station.url === track.url)
      : undefined;
    if (station) {
      this.nowPlayingService.tune(station);
    } else {
      this.nowPlayingService.stop();
    }
  });

  constructor(private nowPlayingService: NowPlayingService) {}

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
