import { levelPercent, type AmbienceState } from '../ambience/ambience';
import type { NowPlaying } from '../now-playing/kinds';

/**
 * The words both marquees show, derived from the state each surface publishes.
 * The Menu bar's Now Playing line and the Ambience readout read the same
 * sentences here, so the two can never tell the listener different things.
 */

/** What both surfaces say when nothing is held or tuned. */
export const NOTHING_PLAYING = 'Nothing playing';

/**
 * The separator both joins put between a name and what follows it, so a credit
 * trails the Sound the way a title trails its artist.
 */
export const SEPARATOR = ' - ';

/**
 * The Menu bar's Now Playing line: a track or Station descriptor as artist,
 * separator, title, and the shared sentence when nothing is tuned.
 */
export function nowPlayingLine(track: NowPlaying | undefined): string {
  if (!track) {
    return NOTHING_PLAYING;
  }
  return track.artist
    ? `${track.artist}${SEPARATOR}${track.title}`
    : track.title;
}

/** The one predicate the Applet's icon and the Menu's mute item both answer. */
function isAudible(state: AmbienceState): boolean {
  return state.playing && !state.muted;
}

/** The held Sound's name, or the shared sentence for holding nothing. */
export function soundName(state: AmbienceState): string {
  return state.sound?.name ?? NOTHING_PLAYING;
}

/** The held Sound's creator, as the credit both surfaces show beside the name. */
export function soundCredit(state: AmbienceState): string {
  return state.sound ? `${SEPARATOR}${state.sound.creator}` : '';
}

/** The name with its credit, for the places that read as one line. */
export function creditedName(state: AmbienceState): string {
  return `${soundName(state)}${soundCredit(state)}`;
}

/** The Menu's level, as the number the Volume + and − items move. */
export function levelLabel(state: AmbienceState): string {
  return `Volume: ${levelPercent(state.volume)}%`;
}

/** The Menu's mute item, labelled with the action pressing it performs. */
export function muteActionLabel(state: AmbienceState): string {
  return isAudible(state) ? 'Mute' : 'Unmute';
}

/**
 * The Menu's playback item, labelled with the action pressing it performs: the
 * one control says whether the machine is running, so there is no moment where
 * Play and Stop are both on offer and nothing says which one is current.
 */
export function playbackActionLabel(state: AmbienceState): string {
  return state.playing ? 'Stop' : 'Play';
}

/**
 * The Applet's tooltip: the mute, and the Sound it is holding, credited. The
 * icon answers a different question — is the machine running — so a latched
 * mute shows here while the icon stays on with the playback it describes.
 */
export function appletLabel(state: AmbienceState): string {
  return state.muted && state.sound
    ? `Muted — ${creditedName(state)}`
    : creditedName(state);
}
