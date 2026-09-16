import { type AnnouncementContent } from '../../components/announcements/announcements.component';
import { FeatureId } from '../feature/feature';

export interface Options {
  /** Which Feature the Pop-up speaks for. */
  id: FeatureId;
  /** About's text, or the Announcements list the Pop-up shows the latest of. */
  contents: string | AnnouncementContent[];
}
