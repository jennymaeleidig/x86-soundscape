import { type AnnouncementContent } from '../../components/announcements/announcements.component';
import { Feature } from '../../../assets/applets/applet-definitions';

export interface Options {
  /** About's text, or the Announcements list the Pop-up shows the latest of. */
  contents: string | AnnouncementContent[];
  selector: Feature;
}
