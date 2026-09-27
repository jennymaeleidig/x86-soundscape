import { levelPercent, type AmbienceState } from './ambience';

/**
 * The words the Applet and the Menu show, derived from the one published state.
 * Both surfaces read these, so neither can tell the listener something
 * different about the one Sound Ambience holds.
 */

/** What both surfaces say when nothing is held or tuned. */
export const NOTHING_PLAYING = 'Nothing playing';

/**
 * The separator the player puts between artist and title (`formatTrack`), so a
 * credit trails the name the way a title trails its artist, and a track reads
 * as one line.
 */
export const SEPARATOR = ' - ';

/** The one predicate the Applet's icon and the Menu's mute item both answer. */
export function isAudible(state: AmbienceState): boolean {
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
