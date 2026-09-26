import {
  Component,
  Pipe,
  PipeTransform,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PopUpService } from '../../services/pop-up/pop-up.service';
import { FeatureId } from '../../services/feature/feature';
import { AboutComponent } from '../about/about.component';
import { AnnouncementsComponent } from '../announcements/announcements.component';
import { WinampService } from '../../services/winamp/winamp.service';
import { type PlaybackState } from '../../services/winamp/playback-state';
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
  constructor(
    private popUpService: PopUpService,
    private winampService: WinampService,
    private ambienceService: AmbienceService,
  ) {}

  private readonly nowPlayingService = inject(NowPlayingService);

  /** The published Now Playing reading; `undefined` means nothing is tuned. */
  private readonly nowPlaying = toSignal(this.nowPlayingService.nowPlaying$, {
    initialValue: undefined,
  });

  /** The player's published playback state, the row's mark's only input. */
  private readonly playbackState = toSignal(this.winampService.playbackState$, {
    initialValue: 'none' as PlaybackState,
  });

  /**
   * Whether the Now Playing row carries the paused mark. Pausing a Station is
   * the only mark: playing and nothing-tuned both read mark-free, because
   * there is nothing paused to say.
   */
  readonly paused = computed(() => this.playbackState() === 'paused');

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

  /**
   * The bar's whole readout, with no prefix: a track or a Station descriptor
   * as `artist - title`, and nothing tuned as the shared sentence.
   */
  readonly reading = computed(() => {
    const track = this.nowPlaying();
    if (!track) {
      return NOTHING_PLAYING;
    }
    return track.artist
      ? `${track.artist}${SEPARATOR}${track.title}`
      : track.title;
  });

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
