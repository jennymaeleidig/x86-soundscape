import { type AnnouncementContent } from '../../components/announcements/announcements.component';
import { FeatureId } from '../feature/feature';

/**
 * What the Menu hands the Pop-up host: which Feature the dialog speaks for, and
 * the content that Feature's Pop-up shape shows — About's text, or the
 * Announcements list the Pop-up shows the latest of.
 */
export type Options =
  | { id: FeatureId.About; contents: string }
  | { id: FeatureId.Announcements; contents: AnnouncementContent[] };
