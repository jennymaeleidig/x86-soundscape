import { Component, Inject, Input } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { WindowService } from '../../services/window/window.service';
import { AboutContent } from '../../../assets/applets/applet-content/about';
import { AnnoucementContent } from '../../../assets/applets/applet-content/annoucements';
import { AppletTypes } from '../../../assets/applets/applet-definitions';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { WinampService } from '../../services/winamp/winamp.service';
import { AmbienceService } from '../../services/ambience/ambience';

// Define constants for the icon paths
const AMBIENCE_OFF_ICON = 'assets/images/ambience_off.png';
const AMBIENCE_ON_ICON = 'assets/images/ambience_on.png';

@Component({
  selector: 'app-applet',
  standalone: true,
  imports: [CdkDragHandle, NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './applet.component.html',
  styleUrl: './applet.component.css',
})
export class AppletComponent {
  @Input() title!: string;
  @Input() icon!: string;
  @Input() selector!: AppletTypes;
  @Input() windowContent!: AboutContent | AnnoucementContent[] | string;
  AppletTypes = AppletTypes;

  constructor(
    private windowService: WindowService,
    private winampService: WinampService,
    private ambienceAudioService: AmbienceService,
    @Inject('appletIsMoving') public setAppletIsMoving: Function,
  ) {}

  ngOnDestroy(): void {
    // Ensure ambience is stopped if the applet is destroyed
    if (this.selector === AppletTypes.Ambience) {
      this.ambienceAudioService.stopAmbience();
    }
  }

  openWindowComponent() {
    this.windowService.open({
      selector: this.selector,
      windowContent: this.windowContent,
    });
  }

  openWinamp() {
    this.winampService.reopenWinamp();
  }

  playRadio() {
    this.winampService.playRadio();
  }

  setMoving() {
    this.setAppletIsMoving(true);
  }

  unsetMoving() {
    this.setAppletIsMoving(false);
  }

  getIcon(): string {
    if (this.selector === AppletTypes.Ambience) {
      return this.ambienceAudioService.isPlaying()
        ? AMBIENCE_ON_ICON
        : AMBIENCE_OFF_ICON;
    }
    return this.icon;
  }

  toggleAmbience() {
    if (this.selector === AppletTypes.Ambience) {
      if (this.ambienceAudioService.isPlaying()) {
        this.ambienceAudioService.stopAmbience();
      } else {
        this.ambienceAudioService.playRandomAmbience();
      }
    }
  }

  getAmbienceName(): string {
    if (this.selector === AppletTypes.Ambience) {
      return this.ambienceAudioService.getAmbienceName();
    } else {
      return 'N / A';
    }
  }
}
