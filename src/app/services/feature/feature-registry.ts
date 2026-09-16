import { computed, Injectable, signal } from '@angular/core';
import { FeatureId, type Feature, type WindowDescription } from './feature';
import { WindowService } from '../window/window.service';
import { WinampService } from '../winamp/winamp.service';
import { AmbienceService } from '../ambience/ambience';
import { appletLabel, isAudible } from '../ambience/ambience-labels';
import { AboutComponent } from '../../components/about/about.component';
import { AnnouncementsComponent } from '../../components/announcements/announcements.component';
import { SurferComponent } from '../../components/surfer/surfer.component';
import { WeatherComponent } from '../../components/weather/weather.component';

const AMBIENCE_ON_ICON = 'assets/images/ambience_on.png';
const AMBIENCE_OFF_ICON = 'assets/images/ambience_off.png';

/**
 * The seven rows, built once, by the only thing that builds them. It is not a
 * lookup table: each row's `activate` is a closure over the injected services,
 * so no row has to reach for a global, and adding a Feature is one component
 * plus one row here.
 */
@Injectable({ providedIn: 'root' })
export class FeatureRegistry {
  readonly features: Feature[];

  constructor(
    private readonly windows: WindowService,
    private readonly winamp: WinampService,
    private readonly ambience: AmbienceService,
  ) {
    this.features = [
      this.windowFeature(FeatureId.About, 'About', 'assets/images/Note.png', {
        shape: 'text',
        height: '50%',
        content: AboutComponent,
      }),
      this.windowFeature(
        FeatureId.Announcements,
        'Announcements',
        'assets/images/Annouce.png',
        { shape: 'text', height: '75%', content: AnnouncementsComponent },
      ),
      this.windowFeature(
        FeatureId.Visualizer,
        'Visualizer',
        'assets/images/Viz.png',
        {
          shape: 'embed',
          content: SurferComponent,
        },
      ),
      this.actionFeature(
        FeatureId.Webamp,
        'Webamp',
        'assets/images/Sound.png',
        () => this.winamp.reopenWinamp(),
      ),
      this.actionFeature(
        FeatureId.PlayRadio,
        'Play Radio',
        'assets/images/x86.png',
        () => this.winamp.playRadio(),
      ),
      // The one row whose appearance is computed rather than static: the icon
      // answers isAudible over the published state — the same predicate the
      // Menu's mute item reads — and the tooltip names the held Sound through
      // the shared wording module, so the Applet and the Menu cannot disagree.
      {
        id: FeatureId.Ambience,
        title: 'Ambience',
        appearance: computed(() => {
          const state = this.ambience.state();
          return {
            icon: isAudible(state) ? AMBIENCE_ON_ICON : AMBIENCE_OFF_ICON,
            tooltip: appletLabel(state),
          };
        }),
        activate: () => this.ambience.toggle(),
      },
      this.windowFeature(
        FeatureId.Weather,
        'Weather',
        'assets/images/twc.png',
        {
          shape: 'embed',
          content: WeatherComponent,
        },
      ),
    ];
  }

  private windowFeature(
    id: FeatureId,
    title: string,
    icon: string,
    window: WindowDescription,
  ): Feature {
    return {
      id,
      title,
      appearance: signal({ icon }),
      window,
      activate: () => this.windows.open({ id, title, window }),
    };
  }

  private actionFeature(
    id: FeatureId,
    title: string,
    icon: string,
    activate: () => void,
  ): Feature {
    return { id, title, appearance: signal({ icon }), activate };
  }
}
