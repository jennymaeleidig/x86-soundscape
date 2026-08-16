import AboutInput, { AboutContent } from './applet-content/about';
import AnnouncementsInput, {
  AnnouncementContent,
} from './applet-content/announcements';

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
  windowContent: AboutContent | AnnouncementContent[] | string | undefined;
}

export default class AppletDefinitions {
  static appletDefinitions: AppletDefinition[] = [
    {
      title: 'Ambience',
      icon: 'assets/images/ambience_off.png',
      selector: Feature.Ambience,
      windowContent: undefined,
    },
    {
      title: 'Visualizer',
      icon: 'assets/images/Viz.png',
      selector: Feature.Visualizer,
      windowContent: undefined,
    },
    {
      title: 'Webamp',
      icon: 'assets/images/Sound.png',
      selector: Feature.Winamp,
      windowContent: undefined,
    },
    {
      title: 'About',
      icon: 'assets/images/Note.png',
      selector: Feature.About,
      windowContent: AboutInput.aboutInput,
    },
    {
      title: 'Announcements',
      icon: 'assets/images/Annouce.png',
      selector: Feature.Announcements,
      windowContent: AnnouncementsInput.announcementsInput,
    },
    {
      title: 'Play Radio',
      icon: 'assets/images/x86.png',
      selector: Feature.Station,
      windowContent: undefined,
    },
    {
      title: 'Weather',
      icon: 'assets/images/twc.png',
      selector: Feature.Weather,
      windowContent: undefined,
    },
  ];
}
