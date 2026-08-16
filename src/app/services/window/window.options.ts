import { AboutContent } from '../../../assets/applets/applet-content/about';
import { AnnouncementContent } from '../../../assets/applets/applet-content/announcements';
import { Feature } from '../../../assets/applets/applet-definitions';

export interface Options {
  selector: Feature;
  windowContent: AboutContent | AnnouncementContent[] | string;
}
