import { Injectable } from '@angular/core';
import Webamp from 'webamp';
import Stations from '../../../assets/audio/stations';
import { NowPlayingService } from '../now-playing/now-playing.service';
import { playbackState$ } from './playback-state';
import { wireTuneGate } from './tune-gate';

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
   * The cache over the engine's own authority on whether audio runs. The
   * store is the single funnel for every real status change — the element's
   * own events included, which the public hooks cannot see (a skin's Stop
   * button lands there as paused → stopped) — so the engine's store
   * subscription is this one line, with the short status poll inside
   * `playbackState$` as the fallback if it ever moves.
   */
  readonly playbackState$ = playbackState$({
    status: () => this.webamp.getPlayerMediaStatus(),
    subscribe: (onChange) => this.webamp.store.subscribe(onChange),
  });

  /**
   * The player drives Now Playing: a track change tunes the Station it
   * carries, and the playback state gates the tune — playing resumes the
   * poller, pausing suspends it with the reading standing, and none (stop,
   * close, the stream's end) stops it and clears the bar. The hook's "no
   * track" fires for a pause and a stop alike, so it decides nothing here.
   *
   * This is the wiring's release handle: it unsubscribes the playback state
   * and the engine's track-change hook together. Kept, not dropped — what
   * the service owns, it can take back.
   */
  private unsubTuneGate: { unsubscribe(): void };

  constructor(private nowPlayingService: NowPlayingService) {
    // Wired in the body, not a field initializer: the gate is handed the
    // `nowPlayingService` parameter property, and the body runs after the
    // emit assigns it — safe under either class-field semantics.
    this.unsubTuneGate = wireTuneGate(
      this.webamp,
      this.playbackState$,
      Stations.stations,
      this.nowPlayingService,
    );
  }

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
