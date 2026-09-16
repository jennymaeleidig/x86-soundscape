import { Injectable, inputBinding, outputBinding } from '@angular/core';
import { PopUpComponent } from '../../components/pop-up/pop-up.component';
import { MountService, type MountHandle } from '../mount/mount';
import { Options } from './pop-up.options';

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

  /** Mounts the Pop-up into the document body, so it overlays the page. */
  open(options: Options) {
    this.close();

    this.handle = this.mount.mount(PopUpComponent, document.body, [
      inputBinding('options', () => options),
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
