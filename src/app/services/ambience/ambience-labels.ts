import type { AmbienceState } from './ambience';

/**
 * The words the Applet and the Menu show, derived from the one published state.
 * Both surfaces read these, so neither can tell the listener something
 * different about the one Sound Ambience holds.
 */

/** What both surfaces say when Ambience holds nothing. */
export const NOTHING_HELD = 'Nothing playing';

/** The one predicate the Applet's icon and the Menu's mute item both answer. */
export function isAudible(state: AmbienceState): boolean {
  return state.playing && !state.muted;
}

/** The held Sound's name, or the shared sentence for holding nothing. */
export function soundName(state: AmbienceState): string {
  return state.sound?.name ?? NOTHING_HELD;
}

/** The Applet's label: which way the sound is going, and which sound it is. */
export function appletLabel(state: AmbienceState): string {
  return state.muted && state.sound
    ? `Muted — ${state.sound.name}`
    : soundName(state);
}
