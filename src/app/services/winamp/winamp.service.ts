import { Inject, Injectable, InjectionToken } from '@angular/core';
import Webamp from 'webamp';
import Stations from '../../../assets/audio/stations';
import { NowPlayingService } from '../now-playing/now-playing.service';
import { ensurePaused, ensurePlaying } from './ensure';
import { playbackState$ } from './playback-state';
import { wireTuneGate } from './tune-gate';

/**
 * The engine, as the wrapper and the wiring see it: the Webamp instance and
 * everything it publishes. Built by the token's factory in the app; a spec
 * provides its own double, so the transport guard can be asserted against a
 * recorded engine rather than a real one.
 */
export const WEBAMP_ENGINE = new InjectionToken<Engine>('webamp engine', {
  providedIn: 'root',
  factory: () =>
    new Webamp({
      initialTracks: Stations.stations,
      initialSkin: {
        url: 'assets/skins/classic_mac_v1.wsz',
      },
      availableSkins: [{ url: 'assets/skins/Old_Mac-OS.wsz', name: 'MacOS' }],
      zIndex: 15,
      enableMediaSession: true,
    }),
});

/** The player's engine: one Webamp instance, the only authority on audio. */
type Engine = InstanceType<typeof Webamp>;

@Injectable({
  providedIn: 'root',
})
export class WinampService {
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

  constructor(
    @Inject(WEBAMP_ENGINE) private readonly webamp: Engine,
    private nowPlayingService: NowPlayingService,
  ) {
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

  /**
   * The transport commands are ensured, not sent: the guard reads the
   * engine's status and decides, so neither the Menu nor any other surface
   * has to. The engine's own `play` restarts a running track and its `pause`
   * toggles, and both live behind the guard — `next()` and `prev()` stay
   * pass-through, the engine auto-playing a track it tunes.
   */
  play() {
    ensurePlaying(this.webamp.getPlayerMediaStatus(), this.webamp);
  }

  pause() {
    ensurePaused(this.webamp.getPlayerMediaStatus(), this.webamp);
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
