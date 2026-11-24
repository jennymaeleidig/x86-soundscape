import { Inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';
import Webamp from 'webamp';
import Stations from '../../data/stations';
import { NowPlayingService } from '../now-playing/now-playing.service';
import { MEDIA_SESSION, wireMediaSession } from './media-session';
import { playbackState$ } from './playback-state';
import { groupSize$ } from './group-size';
import { wireTuneGate } from './tune-gate';
import type { MediaSessionSurface } from './media-session';

/**
 * The engine, as the wrapper and the wiring see it: the Webamp instance and
 * everything it publishes. Built by the token's factory in the app; a spec
 * provides its own double, so the guarded transport can be asserted against a
 * recorded engine rather than a real one.
 */
export const WEBAMP_ENGINE = new InjectionToken<Engine>('webamp engine', {
  providedIn: 'root',
  factory: () => {
    // No initial tracks: constructing the player must perform no media
    // request, and no row may read as current before a gesture. The playlist
    // is filled from the Station list instead, below.
    const engine = new Webamp({
      initialTracks: [],
      initialSkin: {
        url: 'assets/skins/classic_mac_v1.wsz',
      },
      availableSkins: [{ url: 'assets/skins/Old_Mac-OS.wsz', name: 'MacOS' }],
      zIndex: 15,
      // The engine's own media-session integration stays off: the adapter in
      // `media-session.ts` is the widget's one writer, and a second one
      // behind the engine's back would fight it for the metadata.
      enableMediaSession: false,
    });
    // Every Station declares both its duration and its metadata, so the
    // playlist fill is the no-fetch load style — nothing is lazy-loaded —
    // and the playlist window lists every Station on load, with no row
    // reading as current until a real gesture tunes one.
    engine.appendTracks(Stations.stations);
    // The playlist repeats: Next on the last Station wraps to the first
    // rather than ending the broadcast — the engine's own flag, not wrap
    // code of ours. Repeat defaults to off, so one toggle turns it on.
    if (!engine.isRepeatEnabled()) {
      engine.toggleRepeat();
    }
    return engine;
  },
});

/** The player's engine: one Webamp instance, the only authority on audio. */
type Engine = InstanceType<typeof Webamp>;

@Injectable({
  providedIn: 'root',
})
export class WinampService implements OnDestroy {
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
   * The union of the player's open windows, read from the engine's public
   * typed store field and republished whenever its state changes. The mount
   * node consumes this as a minimum, so the rectangle the engine's drag clamps
   * against is never smaller than the group it confines — the one condition
   * the clamp's arithmetic needs to write a legal coordinate.
   */
  readonly groupSize$ = groupSize$({
    windows: () => this.webamp.store.getState().windows.genWindows,
    doubled: () => this.webamp.store.getState().display.doubled,
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
  /** The Media Session adapter's handle, kept like its sibling above. */
  private unsubMediaSession: { unsubscribe(): void };

  /**
   * Whether a Station has ever been tuned by a real gesture. The fact lives
   * here — the player, where the playback state it gates is owned — and is
   * recorded by the tune gate as it forwards the tune, not reinvented from
   * the engine's status: a player that has never been tuned has no source
   * for the engine to reach.
   */
  private everTuned = false;

  constructor(
    @Inject(WEBAMP_ENGINE) private readonly webamp: Engine,
    private nowPlayingService: NowPlayingService,
    @Inject(MEDIA_SESSION)
    private readonly mediaSession: MediaSessionSurface | undefined,
  ) {
    // Wired in the body, not a field initializer: the gate is handed the
    // `nowPlayingService` parameter property, and the body runs after the
    // emit assigns it — safe under either class-field semantics.
    this.unsubTuneGate = wireTuneGate(
      this.webamp,
      this.playbackState$,
      Stations.stations,
      // The gate forwards to Now Playing and records the tune here on the
      // way through: a tune that arrived was a real gesture's tune.
      {
        tune: (station) => {
          this.everTuned = true;
          this.nowPlayingService.tune(station);
        },
        stop: () => this.nowPlayingService.stop(),
        suspend: () => this.nowPlayingService.suspend(),
        resume: () => this.nowPlayingService.resume(),
      },
    );
    // The Media Session's one writer: it follows Now Playing and the
    // playback state this service publishes, and its buttons land on this
    // service's guarded transport. The session comes from the token — a
    // browser without the API passes nothing, and the adapter stands down.
    this.unsubMediaSession = wireMediaSession(
      this.nowPlayingService.nowPlaying$,
      this.playbackState$,
      this,
      this.mediaSession,
    );
  }

  /**
   * Renders the player into the given mount element. The element is the
   * argument, not stored state, so the ordering the old set-then-render pair
   * only documented is now the only call a caller can make.
   */
  renderWinamp(mount: HTMLElement) {
    this.webamp.renderInto(mount);
  }

  reopenWinamp() {
    this.webamp.reopen();
  }

  /**
   * The Play Radio Action's own Gesture: reopen, tune the whole playlist and
   * play. Unguarded by design — it is what a listener presses to start the
   * radio, so it must tune even when nothing was ever tuned. The guarded
   * transport Play below delegates here for exactly that first press.
   */
  playRadio() {
    this.webamp.reopen();
    this.webamp.setTracksToPlay(Stations.stations);
    this.webamp.play();
  }

  /**
   * The transport commands are guarded, not sent: each reads the engine's
   * status and decides, so neither the Menu nor any other surface has to.
   * The engine's own `play` restarts a running track and its `pause`
   * toggles, and both live behind that read — `next()` and `prev()` stay
   * pass-through, the engine auto-playing a track it tunes.
   *
   * Unlike the Play Radio Action's unguarded Gesture, this Play keeps a
   * second press standing; only its first press on an untuned player
   * delegates to that Gesture.
   */
  play() {
    // No Station has ever been tuned: the engine holds no source, and play
    // on it would reach the media element with no stream, swallow the
    // rejection and mark itself playing — silence under a title bar that
    // lies. Delegating to tuning tunes the first Station and plays it; the
    // first play buffers for a moment rather than resuming a warm buffer,
    // which is the accepted cost of no connection before the listener asks.
    if (!this.everTuned) {
      this.playRadio();
      return;
    }
    // A play command that cannot stop on a second press: already playing it
    // is the identity, paused it unpauses, stopped or ended it starts the
    // current track. A closed player is reopened first, so audio never plays
    // from a hidden player with no surface holding intent about it — and the
    // OS play control, reading the engine through this service, inherits the
    // same decision.
    const status = this.webamp.getPlayerMediaStatus();
    if (status === 'PLAYING') {
      return;
    }
    if (status === 'CLOSED') {
      this.webamp.reopen();
    }
    this.webamp.play();
  }

  pause() {
    // A pause command that cannot resume on a second press: only a playing
    // engine pauses — the engine's own pause would start a stopped or closed
    // player — and every other status is left standing.
    if (this.webamp.getPlayerMediaStatus() === 'PLAYING') {
      this.webamp.pause();
    }
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

  ngOnDestroy() {
    this.unsubTuneGate.unsubscribe();
    this.unsubMediaSession.unsubscribe();
  }
}
