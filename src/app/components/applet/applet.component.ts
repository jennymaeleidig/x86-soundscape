import { Component, HostListener, Inject, Input } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { type Feature } from '../../services/feature/feature';

/**
 * A desktop icon that represents one Feature: it shows the row's appearance and
 * asks the row to activate. No Feature is special here — adding one is a
 * component and a row in the registry, never a branch in this component.
 */
@Component({
  selector: 'app-applet',
  standalone: true,
  imports: [CdkDragHandle],
  templateUrl: './applet.component.html',
  styleUrl: './applet.component.css',
})
export class AppletComponent {
  @Input({ required: true }) feature!: Feature;

  constructor(
    @Inject('appletIsMoving') public setAppletIsMoving: Function,
    @Inject('appletDragState')
    private appletDragState: {
      isDragGesture: () => boolean;
      reset: () => void;
    },
  ) {}

  @HostListener('touchstart')
  @HostListener('mousedown')
  onGestureStart() {
    this.appletDragState.reset();
  }

  /** Activates the Feature, unless the gesture was a drag across the Desktop. */
  activate() {
    if (this.appletDragState.isDragGesture()) {
      return;
    }
    this.feature.activate();
  }

  setMoving() {
    this.setAppletIsMoving(true);
  }

  unsetMoving() {
    this.setAppletIsMoving(false);
  }
}
