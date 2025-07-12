import { Component, ElementRef, HostListener } from '@angular/core';
import { Options } from '../../services/pop-up/pop-up.options';
import { PopUpService } from '../../services/pop-up/pop-up.service';
import { AppletTypes } from '../../../assets/applets/applet-definitions';
import { NgClass, CommonModule } from '@angular/common';
import { AnnoucementContent } from '../../../assets/applets/applet-content/annoucements';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-pop-up',
  standalone: true,
  imports: [NgClass, CommonModule],
  templateUrl: './pop-up.component.html',
  styleUrl: './pop-up.component.css',
})
export class PopUpComponent {
  options!: Options;
  AppletTypes = AppletTypes;

  constructor(
    private popUpService: PopUpService,
    private element: ElementRef,
    private deviceService: DeviceDetectorService,
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

  getLatest(): AnnoucementContent {
    if (this.options.selector === AppletTypes.Annoucements) {
      return (this.options.contents as AnnoucementContent[])[0];
    }
    return {
      title: '',
      msg: '',
      date: '',
    };
  }

  isMobileRes(): boolean {
    return this.deviceService.isMobile() || this.deviceService.isTablet();
  }
}
