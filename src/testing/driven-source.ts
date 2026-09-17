import {
  EnginePlaybackStatus,
  StatusSource,
} from '../app/services/winamp/playback-state';

/**
 * The driven status source a spec hands the playback-state module instead of
 * the engine's store: the spec sets `now` and calls `notify()` the way the
 * store's notification would arrive.
 */
export class DrivenSource implements StatusSource {
  now: EnginePlaybackStatus = 'STOPPED';
  subscribers = 0;

  private listeners = new Set<() => void>();

  status(): EnginePlaybackStatus {
    return this.now;
  }

  subscribe(onChange: () => void): () => void {
    this.listeners.add(onChange);
    this.subscribers += 1;
    return () => {
      this.listeners.delete(onChange);
      this.subscribers -= 1;
    };
  }

  /** The store's notification: status has moved, listeners are told. */
  notify(): void {
    for (const listener of [...this.listeners]) {
      listener();
    }
  }
}
