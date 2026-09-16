import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
} from '@angular/core';
import { Options } from '../../services/pop-up/pop-up.options';
import { FeatureId } from '../../services/feature/feature';
import { CommonModule } from '@angular/common';
import { AnnouncementContent } from '../announcements/announcements.component';

/**
 * One dialog in front of the page. It injects nothing and knows nothing about
 * the host: everything it needs arrives as the `options` input, and its whole
 * conversation with its host is `onClose`.
 */
@Component({
  selector: 'app-pop-up',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pop-up.component.html',
  styleUrl: './pop-up.component.css',
})
export class PopUpComponent {
  /** Which Feature the dialog speaks for, and the content its shape shows. */
  @Input({ required: true }) options!: Options;

  @Output() readonly onClose = new EventEmitter<void>();

  FeatureId = FeatureId;

  @HostListener('document:keydown.escape')
  onEscape() {
    this.onClose.emit();
  }

  /** The latest announcement, for the Announcements shape — which is the only one that asks. */
  getLatest(): AnnouncementContent | undefined {
    return this.options.id === FeatureId.Announcements
      ? this.options.contents[0]
      : undefined;
  }
}
