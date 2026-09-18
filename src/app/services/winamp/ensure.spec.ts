import type { EnginePlaybackStatus } from './playback-state';
import { ensurePaused, ensurePlaying, EngineControls } from './ensure';

/**
 * A record of which engine verbs ran, in order. The engine's own verbs are
 * what the guard decides between; nothing else is asserted.
 */
function recordingTransport(): { calls: string[]; engine: EngineControls } {
  const calls: string[] = [];
  return {
    calls,
    engine: {
      play: () => calls.push('play'),
      pause: () => calls.push('pause'),
      reopen: () => calls.push('reopen'),
    },
  };
}

describe('the transport guard', () => {
  describe('ensure playing', () => {
    it('is the identity when the engine is already playing', () => {
      const { calls, engine } = recordingTransport();
      ensurePlaying('PLAYING', engine);
      expect(calls).toEqual([]);
    });

    it('unpauses when the engine is paused', () => {
      const { calls, engine } = recordingTransport();
      ensurePlaying('PAUSED', engine);
      expect(calls).toEqual(['play']);
    });

    it('plays when the engine is stopped or ended', () => {
      const { calls, engine } = recordingTransport();
      ensurePlaying('STOPPED', engine);
      ensurePlaying('ENDED', engine);
      expect(calls).toEqual(['play', 'play']);
    });

    it('reopens a closed player before playing, so audio never comes from a hidden player', () => {
      const { calls, engine } = recordingTransport();
      ensurePlaying('CLOSED', engine);
      expect(calls).toEqual(['reopen', 'play']);
    });
  });

  describe('ensure paused', () => {
    it('is the identity when the engine is already paused', () => {
      const { calls, engine } = recordingTransport();
      ensurePaused('PAUSED', engine);
      expect(calls).toEqual([]);
    });

    it('pauses only a playing engine — the engine’s own pause is a toggle, so every other status must stay untouched', () => {
      const statuses: EnginePlaybackStatus[] = [
        'PAUSED',
        'STOPPED',
        'ENDED',
        'CLOSED',
      ];
      for (const status of statuses) {
        const { calls, engine } = recordingTransport();
        ensurePaused(status, engine);
        expect(calls).toEqual([]);
      }
    });

    it('pauses a playing engine', () => {
      const { calls, engine } = recordingTransport();
      ensurePaused('PLAYING', engine);
      expect(calls).toEqual(['pause']);
    });
  });
});
