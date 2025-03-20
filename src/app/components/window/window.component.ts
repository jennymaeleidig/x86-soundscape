import { Component } from '@angular/core';
import {CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-window',
  standalone: true,
  imports: [CdkDrag, CdkDragHandle],
  templateUrl: './window.component.html',
  styleUrl: './window.component.css'
})
export class WindowComponent {

}
