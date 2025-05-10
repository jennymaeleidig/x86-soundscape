import { Component, Pipe, PipeTransform } from '@angular/core';
import { PopUpService } from '../../services/pop-up/pop-up.service';
import { AppletTypes } from '../../../assets/applets/applet-definitions';
import AboutInput from '../../../assets/applets/applet-content/about';
import AnnoucementsInput from '../../../assets/applets/applet-content/annoucements';
import { WinampService } from '../../services/winamp/winamp.service';
import { MetadataService } from '../../services/metadata/metadata.service';

@Pipe({ name: 'decodeHtmlString', standalone: true })
export class DecodeHtmlString implements PipeTransform {
  transform(value: string) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = value;
    return tempElement.innerText;
  }
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [DecodeHtmlString],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  currentTrack: string = 'Not Playing';
  constructor(
    private popUpService: PopUpService,
    private winampService: WinampService,
    private metadataService: MetadataService,
  ) {}

  ngOnInit() {
    this.metadataService.currentTrack$.subscribe(
      (current) => (this.currentTrack = current),
    );
  }

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
