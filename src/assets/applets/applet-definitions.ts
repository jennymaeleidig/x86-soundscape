import AboutInput, { AboutContent } from './applet-content/about';
import AnnoucementsInput, {
  AnnoucementContent,
} from './applet-content/annoucements';
import VisualizerInput, {
  VisualizerContent,
} from './applet-content/visualizer';

export enum AppletTypes {
  About,
  Annoucements,
  Visualizer,
  Winamp,
  Stream,
  Default,
}
export interface AppletDefinition extends Record<string, unknown> {
  title: string;
  icon: string;
  selector: AppletTypes;
  windowContent:
    | AboutContent
    | AnnoucementContent[]
    | VisualizerContent
    | string
    | undefined;
}

export default class AppletDefinitions {
  static appletDefinitions: AppletDefinition[] = [
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
      title: 'Visualizer',
      icon: 'assets/images/Viz.png',
      selector: AppletTypes.Visualizer,
      windowContent: VisualizerInput.visualizerInput,
    },
    {
      title: 'Webamp',
      icon: 'assets/images/Sound.png',
      selector: AppletTypes.Winamp,
      windowContent: undefined,
    },
    {
      title: 'Play Radio',
      icon: 'assets/images/x86.png',
      selector: AppletTypes.Stream,
      windowContent: undefined,
    },
  ];
}
