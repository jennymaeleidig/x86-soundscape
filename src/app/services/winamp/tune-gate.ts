import type { Station } from '../../data/stations';
import type { Observable } from 'rxjs';
import type { PlaybackState } from './playback-state';

/** A track as the engine announces it: the URL is all the wiring matches on. */
export interface EngineTrack {
  url: string;
}

/**
 * The engine surface the wiring follows for track changes. A track is all the
 * wiring matches on; the engine's own word for one is wider.
 */
export interface TrackChangeSource {
  onTrackDidChange(cb: (track: EngineTrack | null) => void): () => void;
}

/**
 * What the player may call on the tune: the track-change hook's `tune`, and
 * the gate the playback state drives. Now Playing holds no reference to the
 * player — this is the one direction the two modules speak.
 */
export interface TuneGate {
  tune(station: Station): void;
  stop(): void;
  suspend(): void;
  resume(): void;
}

/**
 * The player drives Now Playing, and the two announcements arrive on different
 * wires: the Station argument comes with the track-change hook, the gate comes
 * with the playback state.
 *
 * The hook only tunes. Its "no track" fires for a pause and a stop alike — the
 * engine keys the hook to the playing track, which a pause empties — so it
 * decides nothing; the state does. A track that is no Station is nothing to
 * tune, and playing it releases the tune. The state gates what is tuned:
 * playing resumes the poller, pausing suspends it with the reading standing,
 * and none — stop, close, stream's end — stops the tune and clears the bar.
 *
 * Returns one handle that releases both wires — the hook and the state — the
 * way the engine's own unsubscribe handles do.
 */
export function wireTuneGate(
  engine: TrackChangeSource,
  playbackState$: Observable<PlaybackState>,
  stations: readonly Station[],
  tune: TuneGate,
): { unsubscribe(): void } {
  const unsubFromTrackChange = engine.onTrackDidChange((track) => {
    if (!track) {
      // A pause and a stop fire this alike; the state decides.
      return;
    }
    const station = stations.find((candidate) => candidate.url === track.url);
    if (station) {
      tune.tune(station);
    } else {
      tune.stop(); // playing something that is no Station: nothing to tune
    }
  });
  const stateSubscription = playbackState$.subscribe((state) => {
    if (state === 'playing') {
      tune.resume();
    } else if (state === 'paused') {
      tune.suspend();
    } else {
      tune.stop();
    }
  });
  return {
    unsubscribe(): void {
      unsubFromTrackChange();
      stateSubscription.unsubscribe();
    },
  };
}
