import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { PopUpService } from '../../services/pop-up/pop-up.service';
import { PopUpComponent } from '../pop-up/pop-up.component';

@Component({
  selector: 'app-applet',
  standalone: true,
  imports: [CdkDragHandle],
  templateUrl: './applet.component.html',
  styleUrl: './applet.component.css',
})
export class AppletComponent {
  @Input() title!: string;
  @Input() icon!: string;

  constructor(
    private popUpService: PopUpService,
    @Inject('appletIsMoving') public setAppletIsMoving: Function
  ) {}

  //TODO: Adapt this to the Window component / service
  openPopUpComponent() {
    this.popUpService.open(PopUpComponent, {
      msg: 'Hi',
      callback: () => {},
    });
  }

  setMoving() {
    this.setAppletIsMoving(true);
  }

  unsetMoving() {
    this.setAppletIsMoving(false);
  }
}
