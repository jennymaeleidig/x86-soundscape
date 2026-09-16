import { Component, Pipe, PipeTransform, computed } from '@angular/core';
import { PopUpService } from '../../services/pop-up/pop-up.service';
import { FeatureId } from '../../services/feature/feature';
import { AboutComponent } from '../about/about.component';
import { AnnouncementsComponent } from '../announcements/announcements.component';
import { WinampService } from '../../services/winamp/winamp.service';
import { NowPlaying } from '../../services/now-playing/parsers';
import { NowPlayingService } from '../../services/now-playing/now-playing.service';
import { CommonModule } from '@angular/common';
import { NgxMarqueeComponent } from '@omnedia/ngx-marquee';
import { AmbienceService } from '../../services/ambience/ambience';
import {
  NOTHING_PLAYING,
  SEPARATOR,
  levelLabel,
  muteActionLabel,
  soundCredit,
  soundName,
} from '../../services/ambience/ambience-labels';

@Pipe({ name: 'decodeHtmlString', standalone: true })
export class DecodeHtmlString implements PipeTransform {
  transform(value: string) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = value;
    return tempElement.textContent;
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
  /** The published Now Playing reading; `undefined` means nothing is tuned. */
  nowPlaying: NowPlaying | undefined = undefined;
  constructor(
    private popUpService: PopUpService,
    private winampService: WinampService,
    private nowPlayingService: NowPlayingService,
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
    this.nowPlayingService.nowPlaying$.subscribe(
      (nowPlaying) => (this.nowPlaying = nowPlaying),
    );
  }

  /**
   * The bar's whole readout, with no prefix: a track or a Station descriptor
   * as `artist - title`, and nothing tuned as the shared sentence.
   */
  reading(): string {
    const track = this.nowPlaying;
    if (!track) {
      return NOTHING_PLAYING;
    }
    return track.artist
      ? `${track.artist}${SEPARATOR}${track.title}`
      : track.title;
  }

  openAbout() {
    this.popUpService.open({
      id: FeatureId.About,
      contents: AboutComponent.text,
    });
  }

  openAnnouncements() {
    this.popUpService.open({
      id: FeatureId.Announcements,
      contents: AnnouncementsComponent.announcements,
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
