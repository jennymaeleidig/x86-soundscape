import { Component, Injector } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { WinampComponent } from '../winamp/winamp.component';
import { AppletComponent } from '../applet/applet.component';
import { DragToSelectModule } from 'ngx-drag-to-select';
import { NgComponentOutlet, NgFor } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';
import AppletDefinitions from '../../../assets/applets/applet-definitions';

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [
    MenuComponent,
    WinampComponent,
    DragToSelectModule,
    NgFor,
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

  constructor() {}

  ngOnInit() {}

  setAppletIsMoving(data: boolean) {
    this.appletIsMoving = data;
  }
}
