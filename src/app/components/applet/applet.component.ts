import { Component } from '@angular/core';
import {CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-applet',
  standalone: true,
  imports: [CdkDrag, CdkDragHandle],
  templateUrl: './applet.component.html',
  styleUrl: './applet.component.css'
})
export class AppletComponent {

}
