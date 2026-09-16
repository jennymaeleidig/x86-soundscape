import { type Signal, type Type } from '@angular/core';

/**
 * The identity of a Feature. It is deliberately apart from the Feature value:
 * the Desktop copies every row into its own position-carrying object, and a
 * lookup keyed on the row itself would silently stop matching after the copy.
 * The identity is the key; the row is the value.
 */
export enum FeatureId {
  About,
  Announcements,
  Visualizer,
  Webamp,
  PlayRadio,
  Ambience,
  Weather,
}

/** How a Feature's Applet looks: the icon it shows and, when it has one, its tooltip. */
export interface FeatureAppearance {
  icon: string;
  tooltip?: string;
}

/**
 * The Window a Feature opens, described by the Feature itself: which of the two
 * frames the Window builds, the fractional height the `text` shape takes, and
 * the component rendered into its pane. A Window it cannot render is therefore
 * unrepresentable rather than an empty box.
 */
export interface WindowDescription {
  shape: 'text' | 'embed';
  height?: string;
  content: Type<unknown>;
}

/**
 * An actionable unit in the system: its identity, its title, how its Applet
 * looks, the Window it opens (if it has one) and what activating it does. A
 * Feature that opens a Window and a Feature that is an Action are the same kind
 * of thing — an Action is a row with no `window`.
 */
export interface Feature {
  id: FeatureId;
  title: string;
  appearance: Signal<FeatureAppearance>;
  window?: WindowDescription;
  activate(): void;
}
