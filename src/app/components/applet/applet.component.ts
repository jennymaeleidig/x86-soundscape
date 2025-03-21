import { Component, Input } from '@angular/core';
import {CdkDragHandle} from '@angular/cdk/drag-drop';
import { PopUpService } from '../../services/pop-up/pop-up.service';
import { PopUpComponent } from '../pop-up/pop-up.component';

@Component({
  selector: 'app-applet',
  standalone: true,
  imports: [CdkDragHandle],
  templateUrl: './applet.component.html',
  styleUrl: './applet.component.css'
})
export class AppletComponent {
  @Input() title!: string;
  @Input() icon!: string;
  console=console

  constructor(private popUpService: PopUpService) {}

  //TODO: Adapt this to the Window component / service
  openPopUpComponent() { 
    this.popUpService.open(PopUpComponent, {
      msg: "Hi",
      callback: (() => {})
    }
    );
  }
}
