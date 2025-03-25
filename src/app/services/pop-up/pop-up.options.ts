import { AboutContent } from '../../../assets/applets/applet-content/about';
import { AnnoucementContent } from '../../../assets/applets/applet-content/annoucements';
import { AppletTypes } from '../../../assets/applets/applet-definitions';

export interface Options {
  contents: AboutContent | AnnoucementContent[];
  selector: AppletTypes;
}
