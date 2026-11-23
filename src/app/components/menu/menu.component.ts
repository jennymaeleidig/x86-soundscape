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
import { WinampService } from '../../services/winamp/winamp.service';
import { type PlaybackState } from '../../services/winamp/playback-state';
import { NowPlayingService } from '../../services/now-playing/now-playing.service';

import { NgxMarqueeComponent } from '@omnedia/ngx-marquee';
import { AmbienceService } from '../../services/ambience/ambience';
import {
  levelLabel,
  muteActionLabel,
  nowPlayingLine,
  playbackActionLabel,
  soundCredit,
  soundName,
} from '../../services/wording/wording';

@Pipe({ name: 'decodeHtmlString', standalone: true })
export class DecodeHtmlString implements PipeTransform {
  transform(value: string) {
    const parsed = new DOMParser().parseFromString(value, 'text/html');
    return parsed.body.textContent;
  }
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [DecodeHtmlString, NgxMarqueeComponent],
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
   * Whether the Now Playing row is dimmed: any state but playing — paused,
   * stopped and untuned alike — so a running player is the only one that reads
   * bright, rather than a row that is merely quiet.
   */
  readonly idle = computed(() => this.playbackState() !== 'playing');

  /** The published Ambience state; the template reads it rather than a mirror of it. */
  readonly ambienceState = this.ambienceService.state;

  /**
   * Whether Ambience's own marquee reads as stopped. It mirrors the radio's
   * idle dim: the dim says the machine is not running without a second readout,
   * and the label keeps marqueeing for the same reason the radio's does.
   */
  readonly ambienceStopped = computed(() => !this.ambienceState().playing);

  /**
   * What the Menu says about Ambience, all derived from that one state: the
   * Sound's own name and who recorded it, the level the Volume items move, the
   * mute item labelled with the action pressing it performs, and the playback
   * item, likewise labelled with what pressing it does.
   */
  readonly ambienceName = computed(() => soundName(this.ambienceState()));
  readonly ambienceCredit = computed(() => soundCredit(this.ambienceState()));
  readonly ambienceLevel = computed(() => levelLabel(this.ambienceState()));
  readonly muteAction = computed(() => muteActionLabel(this.ambienceState()));
  readonly playbackAction = computed(() =>
    playbackActionLabel(this.ambienceState()),
  );

  /**
   * The bar's whole readout, with no prefix: the shared Now Playing line, so
   * the Menu and the Ambience readout cannot disagree about what is playing.
   */
  readonly reading = computed(() => nowPlayingLine(this.nowPlaying()));

  openAbout() {
    this.popUpService.open(FeatureId.About);
  }

  openAnnouncements() {
    this.popUpService.open(FeatureId.Announcements);
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

  togglePlaybackAmbience() {
    this.ambienceService.togglePlayback();
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
