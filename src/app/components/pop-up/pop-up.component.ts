import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  type Type,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';

/**
 * One dialog in front of the page: its heading, its Feature's own content, and
 * the Chrome around them. It injects nothing and knows nothing about the host:
 * everything it needs arrives as inputs, and its whole conversation with its
 * host is `onClose`.
 */
@Component({
  selector: 'app-pop-up',
  standalone: true,
  imports: [NgComponentOutlet],
  templateUrl: './pop-up.component.html',
  styleUrl: './pop-up.component.css',
})
export class PopUpComponent {
  /** The heading the Pop-up prints, owned by the shape the Feature declares. */
  @Input({ required: true }) title!: string;

  /** The Feature's own content component, rendered once. */
  @Input({ required: true }) content!: Type<unknown>;

  @Output() readonly onClose = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    this.onClose.emit();
  }
}
