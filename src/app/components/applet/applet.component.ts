import { Component, Inject, Input } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { WindowService } from '../../services/window/window.service';
import { AboutContent } from '../../../assets/applets/applet-content/about';
import { AnnoucementContent } from '../../../assets/applets/applet-content/annoucements';
import { VisualizerContent } from '../../../assets/applets/applet-content/visualizer';
import { AppletTypes } from '../../../assets/applets/applet-definitions';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { WinampService } from '../../services/winamp/winamp.service';

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
  @Input() windowContent!:
    | AboutContent
    | AnnoucementContent[]
    | VisualizerContent
    | string;
  AppletTypes = AppletTypes;

  constructor(
    private windowService: WindowService,
    private winampService: WinampService,
    @Inject('appletIsMoving') public setAppletIsMoving: Function,
  ) {}

  //TODO: Adapt this to the Window component / service
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
}
