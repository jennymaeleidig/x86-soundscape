import {
  Component,
  HostListener,
  Inject,
  Input,
  computed,
} from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { WindowService } from '../../services/window/window.service';
import { Feature } from '../../../assets/applets/applet-definitions';
import { type WindowDescription } from '../../services/feature/feature';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { WinampService } from '../../services/winamp/winamp.service';
import { AmbienceService } from '../../services/ambience/ambience';
import {
  appletLabel,
  isAudible,
} from '../../services/ambience/ambience-labels';

// Define constants for the icon paths
const AMBIENCE_OFF_ICON = 'assets/images/ambience_off.png';
const AMBIENCE_ON_ICON = 'assets/images/ambience_on.png';

@Component({
  selector: 'app-applet',
  standalone: true,
  imports: [CdkDragHandle, NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './applet.component.html',
  styleUrl: './applet.component.css',
})
export class AppletComponent {
  @Input() title!: string;
  @Input() icon!: string;
  @Input() selector!: Feature;
  @Input() window!: WindowDescription;
  Feature = Feature;

  constructor(
    private windowService: WindowService,
    private winampService: WinampService,
    private ambienceService: AmbienceService,
    @Inject('appletIsMoving') public setAppletIsMoving: Function,
    @Inject('appletDragState')
    private appletDragState: {
      isDragGesture: () => boolean;
      reset: () => void;
    },
  ) {}

  /** The published Ambience state; the template reads it rather than a mirror of it. */
  readonly ambienceState = this.ambienceService.state;

  /**
   * What the Applet shows for Ambience, derived once from the published state:
   * OFF for anything inaudible — muted or not playing — beside the name of the
   * Sound that will come back.
   */
  readonly ambienceView = computed(() => {
    const state = this.ambienceState();
    return {
      icon: isAudible(state) ? AMBIENCE_ON_ICON : AMBIENCE_OFF_ICON,
      label: appletLabel(state),
    };
  });

  ngOnDestroy(): void {
    // Ensure ambience is stopped if the applet is destroyed
    if (this.selector === Feature.Ambience) {
      this.ambienceService.stop();
    }
  }

  @HostListener('touchstart')
  @HostListener('mousedown')
  onGestureStart() {
    this.appletDragState.reset();
  }

  openWindowComponent() {
    if (this.appletDragState.isDragGesture()) {
      return;
    }
    this.windowService.open({
      id: this.selector,
      title: this.title,
      window: this.window,
    });
  }

  openWinamp() {
    if (this.appletDragState.isDragGesture()) {
      return;
    }
    this.winampService.reopenWinamp();
  }

  playRadio() {
    if (this.appletDragState.isDragGesture()) {
      return;
    }
    this.winampService.playRadio();
  }

  setMoving() {
    this.setAppletIsMoving(true);
  }

  unsetMoving() {
    this.setAppletIsMoving(false);
  }

  toggleAmbience() {
    if (this.appletDragState.isDragGesture()) {
      return;
    }
    if (this.selector === Feature.Ambience) {
      this.ambienceService.toggle();
    }
  }
}
