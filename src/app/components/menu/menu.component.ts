import { Component } from '@angular/core';
import { PopUpService } from '../../services/pop-up/pop-up.service';
import { AppletTypes } from '../../../assets/applets/applet-definitions';
import AboutInput from '../../../assets/applets/applet-content/about';
import AnnoucementsInput from '../../../assets/applets/applet-content/annoucements';
import { WinampService } from '../../services/winamp/winamp.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  constructor(
    private popUpService: PopUpService,
    private winampService: WinampService,
  ) {}

  openAbout() {
    this.popUpService.open({
      selector: AppletTypes.About,
      contents: AboutInput.aboutInput,
    });
  }

  openAnnoucements() {
    this.popUpService.open({
      selector: AppletTypes.Annoucements,
      contents: AnnoucementsInput.accouncementsInput,
    });
  }

  play() {
    this.winampService.play();
  }

  pause() {
    this.winampService.pause();
  }

  prev() {
    this.winampService.prev();
  }

  stop() {
    this.winampService.stop();
  }

  next() {
    this.winampService.next();
  }
}
