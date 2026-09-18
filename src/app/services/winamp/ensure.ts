import type { EnginePlaybackStatus } from './playback-state';

/**
 * The three engine verbs the transport guard decides between. The engine's
 * own `play` and `pause` are not commands — its pause toggles, and its play
 * restarts a running track — so they are reachable only through this
 * module's decisions.
 */
export interface EngineControls {
  play(): void;
  pause(): void;
  reopen(): void;
}

/**
 * Ensure playing: a play command that cannot stop on a second press. Already
 * playing, it is the identity; paused, it unpauses; stopped or ended, it
 * starts the current track. A closed player is reopened first, so audio never
 * plays from a hidden player with no surface holding intent about it — and
 * the OS play control, reading the engine through the player, inherits the
 * same decision.
 */
export function ensurePlaying(
  status: EnginePlaybackStatus,
  engine: EngineControls,
): void {
  if (status === 'PLAYING') {
    return;
  }
  if (status === 'CLOSED') {
    engine.reopen();
  }
  engine.play();
}

/**
 * Ensure paused: a pause command that cannot resume on a second press. Only
 * a playing engine pauses — the engine's own pause would start a stopped or
 * closed player — and every other status is left standing.
 */
export function ensurePaused(
  status: EnginePlaybackStatus,
  engine: EngineControls,
): void {
  if (status === 'PLAYING') {
    engine.pause();
  }
}
