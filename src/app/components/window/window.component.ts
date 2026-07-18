import { Component, inject } from '@angular/core';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { WindowService } from '../../services/window/window.service';
import { Options } from '../../services/window/window.options';
import { AboutContent } from '../../../assets/applets/applet-content/about';
import { AnnoucementContent } from '../../../assets/applets/applet-content/annoucements';
import { NgClass, CommonModule } from '@angular/common';
import { AppletTypes } from '../../../assets/applets/applet-definitions';
import { SurferComponent } from '../surfer/surfer.component';
import { WeatherComponent } from '../weather/weather.component';
import { WeatherStarService } from '../../services/weather-star/weather-star.service';

@Component({
  selector: 'app-window',
  standalone: true,
  imports: [
    CommonModule,
    CdkDrag,
    CdkDragHandle,
    NgClass,
    SurferComponent,
    WeatherComponent,
  ],
  templateUrl: './window.component.html',
  styleUrl: './window.component.css',
})
export class WindowComponent {
  options!: Options | undefined;
  selector!: AppletTypes;
  windowContent!: AboutContent | AnnoucementContent[] | string;
  cascadeIndex: number = 0;
  AppletTypes = AppletTypes;
  protected readonly weatherStar = inject(WeatherStarService);

  constructor(private windowService: WindowService) {}

  setActive() {
    this.windowService.setActiveWindow(this.selector);
  }

  isActive() {
    return this.selector === this.windowService.getActiveWindow();
  }

  close() {
    this.windowService.close(this.selector);
  }

  addOptions() {
    this.selector = this.options!.selector;
    this.windowContent = this.options!.windowContent;
    this.cascadeIndex = this.windowService.cascadeIndex;
  }

  ngAfterContentInit() {
    this.options = this.windowService.options;
    this.addOptions();
  }
}
