import { Component} from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { WinampComponent } from "../winamp/winamp.component";
import { WindowComponent } from "../window/window.component";
import { AppletComponent } from "../applet/applet.component";
import { DragToSelectModule } from 'ngx-drag-to-select';
import { NgComponentOutlet, NgFor } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [MenuComponent, WinampComponent, WindowComponent, DragToSelectModule, NgFor, NgComponentOutlet, CdkDrag],
  templateUrl: './desktop.component.html',
  styleUrl: './desktop.component.css'
})
export class DesktopComponent {
  selectedApplets: Array<any> = [];
  AppletComponent = AppletComponent;
  appletInputs = [
    {
      title: "About",
      icon: "assets/images/Note.png"
    },
    {
      title: "Visualizer",
      icon: "assets/images/Viz.png"
    },
    {
      title: "Webamp",
      icon: "assets/images/Sound.png"
    },
    {
      title: "Annoucements!",
      icon: "assets/images/Annouce.png"
    }
  ]

  ngOnInit(){
  }

  itemsSelected(event:any){
    console.log(this.selectedApplets)
  }
}
