import { Component, Injector } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { WinampComponent } from '../winamp/winamp.component';
import { AppletComponent } from '../applet/applet.component';
import { DragToSelectModule } from 'ngx-drag-to-select';
import { NgComponentOutlet, NgFor, NgIf } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';
import AppletDefinitions from '../../../assets/applets/applet-definitions';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [
    MenuComponent,
    WinampComponent,
    DragToSelectModule,
    NgFor,
    NgIf,
    NgComponentOutlet,
    CdkDrag,
  ],
  templateUrl: './desktop.component.html',
  styleUrl: './desktop.component.css',
})
export class DesktopComponent {
  selectedApplets: Array<any> = [];
  AppletComponent = AppletComponent;
  console = console;
  appletInputs = AppletDefinitions.appletDefinitions;
  appletIsMoving: boolean = false;
  injector = Injector.create({
    providers: [
      {
        provide: 'appletIsMoving',
        useValue: (data: boolean) => this.setAppletIsMoving(data),
      },
    ],
  });

  constructor(private deviceService: DeviceDetectorService) {}

  ngOnInit() {}

  setAppletIsMoving(data: boolean) {
    this.appletIsMoving = data;
  }

  isMobileRes(): boolean {
    return this.deviceService.isMobile() || this.deviceService.isTablet();
  }
}
