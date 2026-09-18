import type { MediaSessionSurface } from '../app/services/winamp/media-session';

/**
 * The browser's Media Session, as far as the adapter reaches: the two
 * properties it writes and the action handlers it installs. A spec fires the
 * recorded handlers to perform the widget's buttons.
 */
export class FakeMediaSession implements MediaSessionSurface {
  playbackState: MediaSession['playbackState'] = 'none';
  metadata: MediaMetadata | null = null;
  handlers = new Map<string, () => void>();

  setActionHandler(
    action: MediaSessionAction,
    handler: ((details: MediaSessionActionDetails) => void) | null,
  ): void {
    if (handler === null) {
      this.handlers.delete(action);
    } else {
      this.handlers.set(action, handler as () => void);
    }
  }
}
