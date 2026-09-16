import { AboutComponent } from '../../app/components/about/about.component';
import { AnnouncementsComponent } from '../../app/components/announcements/announcements.component';
import { SurferComponent } from '../../app/components/surfer/surfer.component';
import { WeatherComponent } from '../../app/components/weather/weather.component';
import { type WindowDescription } from '../../app/services/feature/feature';

export enum Feature {
  About,
  Announcements,
  Visualizer,
  Winamp,
  Station,
  None,
  Ambience,
  Weather,
}

export interface AppletDefinition extends Record<string, unknown> {
  title: string;
  icon: string;
  selector: Feature;
  /** The Window the Applet opens, or absent for a Feature that is an Action. */
  window?: WindowDescription;
}

export default class AppletDefinitions {
  static appletDefinitions: AppletDefinition[] = [
    {
      title: 'Ambience',
      icon: 'assets/images/ambience_off.png',
      selector: Feature.Ambience,
    },
    {
      title: 'Visualizer',
      icon: 'assets/images/Viz.png',
      selector: Feature.Visualizer,
      window: { shape: 'embed', content: SurferComponent },
    },
    {
      title: 'Webamp',
      icon: 'assets/images/Sound.png',
      selector: Feature.Winamp,
    },
    {
      title: 'About',
      icon: 'assets/images/Note.png',
      selector: Feature.About,
      window: { shape: 'text', height: '50%', content: AboutComponent },
    },
    {
      title: 'Announcements',
      icon: 'assets/images/Annouce.png',
      selector: Feature.Announcements,
      window: { shape: 'text', height: '75%', content: AnnouncementsComponent },
    },
    {
      title: 'Play Radio',
      icon: 'assets/images/x86.png',
      selector: Feature.Station,
    },
    {
      title: 'Weather',
      icon: 'assets/images/twc.png',
      selector: Feature.Weather,
      window: { shape: 'embed', content: WeatherComponent },
    },
  ];
}
