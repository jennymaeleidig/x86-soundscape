import { Component, ElementRef, ViewChild } from '@angular/core';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { WindowService } from '../../services/window/window.service';
import { Options } from '../../services/window/window.options';
import { AboutContent } from '../../../assets/applets/applet-content/about';
import { AnnoucementContent } from '../../../assets/applets/applet-content/annoucements';
import { VisualizerContent } from '../../../assets/applets/applet-content/visualizer';
import {
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  NgFor,
} from '@angular/common';
import { AppletTypes } from '../../../assets/applets/applet-definitions';

@Component({
  selector: 'app-window',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDragHandle,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgFor,
  ],
  templateUrl: './window.component.html',
  styleUrl: './window.component.css',
})
export class WindowComponent {
  @ViewChild('window') window!: ElementRef<HTMLDivElement>;
  options!: Options | undefined;
  selector!: AppletTypes;
  windowContent!:
    | AboutContent
    | AnnoucementContent[]
    | VisualizerContent
    | string;
  AppletTypes = AppletTypes;

  constructor(private windowService: WindowService) {}

  close() {
    this.windowService.close();
  }

  addOptions() {
    this.selector = this.options!.selector;
    this.windowContent = this.options!.windowContent;
  }

  ngAfterContentInit() {
    this.options = this.windowService.options;
    this.addOptions();
  }
}
