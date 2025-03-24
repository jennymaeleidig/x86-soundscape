import { Component, Injector, ViewChild } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { WinampComponent } from '../winamp/winamp.component';
import { WindowComponent } from '../window/window.component';
import { AppletComponent } from '../applet/applet.component';
import { DragToSelectModule } from 'ngx-drag-to-select';
import { NgComponentOutlet, NgFor } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [
    MenuComponent,
    WinampComponent,
    WindowComponent,
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
  // TODO: POssibly extract this value;
  appletInputs = [
    {
      title: 'About',
      icon: 'assets/images/Note.png',
    },
    {
      title: 'Visualizer',
      icon: 'assets/images/Viz.png',
    },
    {
      title: 'Webamp',
      icon: 'assets/images/Sound.png',
    },
    {
      title: 'Annoucements',
      icon: 'assets/images/Annouce.png',
    },
    {
      title: 'Radio Stream',
      icon: 'assets/images/x86.png',
    }
  ];
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
