import { Injectable, inputBinding, outputBinding } from '@angular/core';
import { PopUpComponent } from '../../components/pop-up/pop-up.component';
import { MountService, type MountHandle } from '../mount/mount';
import { FeatureId } from '../feature/feature';
import { POP_UP_VIEWS } from './pop-up.shapes';

/**
 * The Pop-up host. It owns one rule — at most one Pop-up open at a time — and
 * nothing else: it holds the handle of the one open Pop-up, and opening
 * another destroys the one it replaces. The component mounts straight into
 * the document body, so the host retains nothing but the handle: the mount
 * module appends the component's own element and takes exactly it away.
 */
@Injectable({
  providedIn: 'root',
})
export class PopUpService {
  private handle: MountHandle | undefined;

  constructor(private readonly mount: MountService) {}

  /**
   * Mounts the Pop-up for the Feature into the document body, so it overlays
   * the page. The shape's content component is rendered the way the Window
   * host renders its Feature's content, with no data plumbing of its own.
   */
  open(id: FeatureId) {
    const view = POP_UP_VIEWS[id];
    if (!view) {
      throw new Error(`${FeatureId[id]} has no Pop-up view`);
    }

    this.close();

    this.handle = this.mount.mount(PopUpComponent, document.body, [
      inputBinding('title', () => view.title),
      inputBinding('content', () => view.content),
      outputBinding('onClose', () => this.close()),
    ]);
  }

  /**
   * Dismisses the open Pop-up: the handle destroys the component, its view,
   * its DOM subtree and its document Escape listener. Dismissing one that is
   * not open is nothing.
   */
  close() {
    if (!this.handle) return;

    const handle = this.handle;
    this.handle = undefined;
    handle.destroy();
  }
}
