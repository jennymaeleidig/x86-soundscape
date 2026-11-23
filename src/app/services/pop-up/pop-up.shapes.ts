import { type Type } from '@angular/core';
import { FeatureId } from '../feature/feature';
import { AboutComponent } from '../../components/about/about.component';
import { AnnouncementsLatestComponent } from '../../components/announcements-latest/announcements-latest.component';

/** What the Pop-up host renders for a Feature: its heading and its own content component. */
export interface PopUpView {
  title: string;
  content: Type<unknown>;
}

/**
 * The Pop-up views, keyed by Feature. The host owns this mapping so the Menu
 * hands over a Feature identity alone and never a display component.
 */
export const POP_UP_VIEWS: Partial<Record<FeatureId, PopUpView>> = {
  [FeatureId.About]: { title: 'About', content: AboutComponent },
  [FeatureId.Announcements]: {
    title: 'Latest',
    content: AnnouncementsLatestComponent,
  },
};
