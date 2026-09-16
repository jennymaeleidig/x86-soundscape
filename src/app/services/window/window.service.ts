import { Injectable, inputBinding, outputBinding } from '@angular/core';
import { MountService, type MountHandle } from '../mount/mount';
import { WindowComponent } from '../../components/window/window.component';
import { DesktopBounds } from './desktop-bounds';
import { Options } from './window.options';
import { type FeatureId } from '../feature/feature';

/** One open Window: what it was opened for, where it is mounted, and how it goes away. */
interface OpenWindow {
  options: Options;
  mountedElement: HTMLElement;
  handle: MountHandle;
}

/**
 * The Window host. It owns the cascade index, the at-most-one-Window-per-Feature
 * rule and the Active Window, and nothing else: membership of one ordered
 * collection *is* the open set, and the last entry *is* the Active Window, so
 * neither fact can drift from the other.
 */
@Injectable({ providedIn: 'root' })
export class WindowService {
  private readonly windows: OpenWindow[] = [];

  constructor(
    private readonly mount: MountService,
    private readonly bounds: DesktopBounds,
  ) {}

  /** How many Windows are open. The cascade offset depends on this and nothing else. */
  get openCount(): number {
    return this.windows.length;
  }

  /**
   * Opens the Feature's Window, or — when it is already open — raises it: the
   * same move a title-bar press makes, so a second activation brings the
   * Window to the front rather than opening a second one. Raising the
   * already-active Window is the identity.
   */
  open(options: Options): void {
    if (this.isOpen(options.id)) {
      this.raise(options.id);
      return;
    }

    const target = this.bounds.element;
    if (!target) {
      throw new Error('The Desktop bounds are not published yet');
    }

    // The host mounts into one element of its own per Window, so the cascade
    // slot travels as a custom property on the element the host mounts into
    // and the Window itself needs no cascade member. The mount module creates
    // the component's own element inside this one, because Angular clears the
    // element it is handed as a host.
    const mountedElement = document.createElement('div');
    mountedElement.style.setProperty(
      '--cascade-n',
      String(this.windows.length),
    );
    target.appendChild(mountedElement);

    const handle = this.mount.mount(WindowComponent, mountedElement, [
      inputBinding('title', () => options.title),
      inputBinding('shape', () => options.window.shape),
      inputBinding('height', () => options.window.height),
      inputBinding('content', () => options.window.content),
      inputBinding('isActive', () => this.isActive(options.id)),
      outputBinding('onActivate', () => this.raise(options.id)),
      outputBinding('onClose', () => this.close(options.id)),
    ]);

    this.windows.push({ options, mountedElement, handle });
  }

  /**
   * Closes the Feature's Window: the handle destroys the component, its view,
   * its DOM subtree and its listeners, and the entry leaves the collection.
   * Closing the front Window therefore activates the most recently used
   * survivor, and closing the last Window leaves nothing active.
   */
  close(id: FeatureId): void {
    const index = this.indexOf(id);
    if (index < 0) return;

    const [open] = this.windows.splice(index, 1);
    open.handle.destroy();
    open.mountedElement.remove();
  }

  /**
   * Brings an open Window to the front by moving its entry to the end of the
   * collection. State only: no re-parenting and no geometry. Raising the
   * already-active Window is the identity.
   */
  raise(id: FeatureId): void {
    const index = this.indexOf(id);
    if (index < 0 || index === this.windows.length - 1) return;

    const [open] = this.windows.splice(index, 1);
    this.windows.push(open);
  }

  /** Whether the Window belongs to the last entry, which is the Active Window. */
  isActive(id: FeatureId): boolean {
    return this.windows[this.windows.length - 1]?.options.id === id;
  }

  private isOpen(id: FeatureId): boolean {
    return this.indexOf(id) >= 0;
  }

  private indexOf(id: FeatureId): number {
    return this.windows.findIndex((open) => open.options.id === id);
  }
}
