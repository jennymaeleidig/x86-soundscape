import {
  Component,
  HostListener,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { type Feature } from '../../services/feature/feature';
import { AppletDrag } from './applet-drag';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './applet.component.css',
})
export class AppletComponent {
  @Input({ required: true }) feature!: Feature;

  constructor(private readonly drag: AppletDrag) {}

  @HostListener('touchstart')
  @HostListener('mousedown')
  onGestureStart() {
    this.drag.beginGesture();
  }

  /** Activates the Feature, unless the gesture was a drag across the Desktop. */
  activate() {
    if (this.drag.isDragGesture()) {
      return;
    }
    this.feature.activate();
  }

  setMoving() {
    this.drag.setMoving(true);
  }

  unsetMoving() {
    this.drag.setMoving(false);
  }
}
