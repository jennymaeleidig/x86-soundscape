import { Component, ElementRef, HostListener } from '@angular/core';
import { Options } from '../../services/pop-up/pop-up.options';
import { PopUpService } from '../../services/pop-up/pop-up.service';
import { Feature } from '../../../assets/applets/applet-definitions';
import { CommonModule } from '@angular/common';
import { AnnouncementContent } from '../../../assets/applets/applet-content/announcements';
@Component({
  selector: 'app-pop-up',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pop-up.component.html',
  styleUrl: './pop-up.component.css',
})
export class PopUpComponent {
  options!: Options;
  Feature = Feature;

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

  getLatest(): AnnouncementContent {
    if (this.options.selector === Feature.Announcements) {
      return (this.options.contents as AnnouncementContent[])[0];
    }
    return {
      title: '',
      msg: '',
      date: '',
    };
  }
}
