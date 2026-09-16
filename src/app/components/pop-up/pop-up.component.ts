import { Component, ElementRef, HostListener } from '@angular/core';
import { Options } from '../../services/pop-up/pop-up.options';
import { PopUpService } from '../../services/pop-up/pop-up.service';
import { FeatureId } from '../../services/feature/feature';
import { CommonModule } from '@angular/common';
import { AnnouncementContent } from '../announcements/announcements.component';

@Component({
  selector: 'app-pop-up',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pop-up.component.html',
  styleUrl: './pop-up.component.css',
})
export class PopUpComponent {
  options!: Options;
  FeatureId = FeatureId;

  constructor(
    private popUpService: PopUpService,
    private element: ElementRef,
  ) {}

  ngAfterContentInit() {
    this.options = this.popUpService.options;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    // closing modal on escape
    this.popUpService.close();
  }

  onClose() {
    // closing modal when clicking on the overlay
    this.popUpService.close();
  }

  close() {
    this.element.nativeElement.remove();
  }

  /** The latest announcement, for the Announcements shape — which is the only one that asks. */
  getLatest(): AnnouncementContent | undefined {
    return this.options.id === FeatureId.Announcements
      ? this.options.contents[0]
      : undefined;
  }
}
