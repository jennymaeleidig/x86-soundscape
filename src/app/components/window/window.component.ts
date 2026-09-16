import {
  Component,
  EventEmitter,
  Input,
  Output,
  type Type,
} from '@angular/core';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { NgClass, NgComponentOutlet } from '@angular/common';

/**
 * One chrome in front of a given title, shape and content. It injects nothing
 * and knows nothing about Features: everything it needs arrives as an input,
 * and its whole conversation with its host is `isActive`, `onActivate` and
 * `onClose`.
 */
@Component({
  selector: 'app-window',
  standalone: true,
  imports: [CdkDrag, CdkDragHandle, NgClass, NgComponentOutlet],
  templateUrl: './window.component.html',
  styleUrl: './window.component.css',
})
export class WindowComponent {
  /** Printed exactly as given. */
  @Input({ required: true }) title!: string;

  /** Which of the two frames to build. */
  @Input({ required: true }) shape!: 'text' | 'embed';

  /** The `text` shape's fractional height. */
  @Input() height?: string;

  /** The component rendered once into the pane. */
  @Input({ required: true }) content!: Type<unknown>;

  @Input() isActive = false;

  @Output() readonly onActivate = new EventEmitter<void>();
  @Output() readonly onClose = new EventEmitter<void>();
}
