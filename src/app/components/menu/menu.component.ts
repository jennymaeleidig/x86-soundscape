import { Component, Pipe, PipeTransform, computed } from '@angular/core';
import { PopUpService } from '../../services/pop-up/pop-up.service';
import { Feature } from '../../../assets/applets/applet-definitions';
import AboutInput from '../../../assets/applets/applet-content/about';
import AnnouncementsInput from '../../../assets/applets/applet-content/announcements';
import { WinampService } from '../../services/winamp/winamp.service';
import { MetadataService } from '../../services/metadata/metadata.service';
import { CommonModule } from '@angular/common';
import { NgxMarqueeComponent } from '@omnedia/ngx-marquee';
import { AmbienceService } from '../../services/ambience/ambience';
import {
  levelLabel,
  muteActionLabel,
  soundCredit,
  soundName,
} from '../../services/ambience/ambience-labels';
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

  /** The published Ambience state; the template reads it rather than a mirror of it. */
  readonly ambienceState = this.ambienceService.state;

  /**
   * What the Menu says about Ambience, all derived from that one state: the
   * Sound's own name and who recorded it, the level the Volume items move, and
   * the mute item labelled with the action pressing it performs.
   */
  readonly ambienceName = computed(() => soundName(this.ambienceState()));
  readonly ambienceCredit = computed(() => soundCredit(this.ambienceState()));
  readonly ambienceLevel = computed(() => levelLabel(this.ambienceState()));
  readonly muteAction = computed(() => muteActionLabel(this.ambienceState()));

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
    this.ambienceService.play();
  }

  stopAmbience() {
    this.ambienceService.stop();
  }

  shuffleAmbience() {
    this.ambienceService.shuffle();
  }

  volumeUpAmbience() {
    this.ambienceService.volumeUp();
  }

  volumeDownAmbience() {
    this.ambienceService.volumeDown();
  }

  toggleAmbience() {
    this.ambienceService.toggle();
  }
}
