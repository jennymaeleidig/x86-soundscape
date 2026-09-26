import { WindowBoxes, WindowSource } from '../app/services/winamp/group-size';

/**
 * The driven window source a spec hands the group-size module instead of the
 * engine's store: the spec sets `boxes` (and `doubledValue`) and calls
 * `notify()` the way the store's notification would arrive.
 */
export class DrivenWindows implements WindowSource {
  boxes: WindowBoxes = {};
  doubledValue = false;
  subscribers = 0;

  private listeners = new Set<() => void>();

  windows(): WindowBoxes {
    return this.boxes;
  }

  doubled(): boolean {
    return this.doubledValue;
  }

  subscribe(onChange: () => void): () => void {
    this.listeners.add(onChange);
    this.subscribers += 1;
    return () => {
      this.listeners.delete(onChange);
      this.subscribers -= 1;
    };
  }

  /** The store's notification: the layout changed, listeners are told. */
  notify(): void {
    for (const listener of [...this.listeners]) {
      listener();
    }
  }
}
