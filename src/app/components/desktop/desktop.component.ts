import { Component } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { WinampComponent } from "../winamp/winamp.component";
import { WindowComponent } from "../window/window.component";
import { AppletComponent } from "../applet/applet.component";
import { DragToSelectModule } from 'ngx-drag-to-select';
import { NgComponentOutlet, NgFor } from '@angular/common';

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [MenuComponent, WinampComponent, WindowComponent,DragToSelectModule, NgFor, NgComponentOutlet],
  templateUrl: './desktop.component.html',
  styleUrl: './desktop.component.css'
})
export class DesktopComponent {
  applets: Array<any> = [];
  selectedApplets: Array<any> = [];
  AppletComponent = AppletComponent;

  ngOnInit(){
    // generate list of applets
    this.applets.push(new AppletComponent())
  }
}
