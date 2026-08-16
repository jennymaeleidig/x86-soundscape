import { Component, Pipe, PipeTransform } from '@angular/core';
import { PopUpService } from '../../services/pop-up/pop-up.service';
import { Feature } from '../../../assets/applets/applet-definitions';
import AboutInput from '../../../assets/applets/applet-content/about';
import AnnouncementsInput from '../../../assets/applets/applet-content/announcements';
import { WinampService } from '../../services/winamp/winamp.service';
import { MetadataService } from '../../services/metadata/metadata.service';
import { CommonModule } from '@angular/common';
import { NgxMarqueeComponent } from '@omnedia/ngx-marquee';
import { AmbienceService } from '../../services/ambience/ambience';
export const DEFAULT_TITLE = 'N / A';

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
  imports: [DecodeHtmlString, NgxMarqueeComponent, CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  currentTrack: { artist: string; title: string } = {
    artist: 'N',
    title: '/ A',
  };
  constructor(
    private popUpService: PopUpService,
    private winampService: WinampService,
    private metadataService: MetadataService,
    private ambienceService: AmbienceService,
  ) {}

  ngOnInit() {
    this.metadataService.currentTrack$.subscribe(
      (current) => (this.currentTrack = current),
    );
  }

  formatTrack(): string {
    const { artist, title } = this.currentTrack;
    return title ? `${artist} - ${title}` : artist;
  }

  openAbout() {
    this.popUpService.open({
      selector: Feature.About,
      contents: AboutInput.aboutInput,
    });
  }

  openAnnouncements() {
    this.popUpService.open({
      selector: Feature.Announcements,
      contents: AnnouncementsInput.announcementsInput,
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

  playAmbience() {
    this.ambienceService.playAmbience();
  }

  stopAmbience() {
    this.ambienceService.stopAmbience();
  }

  shuffleAmbience() {
    this.ambienceService.playRandomAmbience();
  }

  volumeUpAmbience() {
    this.ambienceService.volumeUp();
  }

  volumeDownAmbience() {
    this.ambienceService.volumeDown();
  }

  getAmbienceName(): string {
    return this.ambienceService.getAmbienceName();
  }
}
