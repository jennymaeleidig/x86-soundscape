/**
 * Video file formats the browser `<video>` element can play.
 *
 * Rebuilt on the actual browser-playability constraint (the agent's list was
 * unprincipled against browser playback). Load-bearing twice: used as the
 * item-level candidate prefilter (search-result `format` array) AND the
 * per-file playable pick (metadata `files[].format`).
 *
 * - Adds `h.264 720P`: a universally-playable h.264 variant the agent missed.
 * - Drops `Ogg Video`: Firefox-only; selecting it produces a silent 404 on
 *   Chrome/Safari and wastes a retry.
 */
export const ACCEPTED_VIDEO_FORMATS: readonly string[] = [
  'h.264',
  'h.264 IA',
  'h.264 720P',
  'MPEG4',
  'WebM',
];
