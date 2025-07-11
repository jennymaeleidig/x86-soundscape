import AboutInput, { AboutContent } from './applet-content/about';
import AnnoucementsInput, {
  AnnoucementContent,
} from './applet-content/annoucements';

export enum AppletTypes {
  About,
  Annoucements,
  Visualizer,
  Winamp,
  Stream,
  Default,
  Attention,
  Ambience,
}
export interface AppletDefinition extends Record<string, unknown> {
  title: string;
  icon: string;
  selector: AppletTypes;
  windowContent: AboutContent | AnnoucementContent[] | string | undefined;
}

export default class AppletDefinitions {
  static appletDefinitions: AppletDefinition[] = [
    {
      title: 'Ambience',
      icon: 'assets/images/ambience_off.png',
      selector: AppletTypes.Ambience,
      windowContent: undefined,
    },
    {
      title: 'Visualizer',
      icon: 'assets/images/Viz.png',
      selector: AppletTypes.Visualizer,
      windowContent: undefined,
    },
    {
      title: 'Webamp',
      icon: 'assets/images/Sound.png',
      selector: AppletTypes.Winamp,
      windowContent: undefined,
    },
    {
      title: 'About',
      icon: 'assets/images/Note.png',
      selector: AppletTypes.About,
      windowContent: AboutInput.aboutInput,
    },
    {
      title: 'Annoucements',
      icon: 'assets/images/Annouce.png',
      selector: AppletTypes.Annoucements,
      windowContent: AnnoucementsInput.accouncementsInput,
    },
    {
      title: 'Play Radio',
      icon: 'assets/images/x86.png',
      selector: AppletTypes.Stream,
      windowContent: undefined,
    },
  ];
}
