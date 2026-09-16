import { type Type } from '@angular/core';

/**
 * The Window a Feature opens, described by the Feature itself: which of the two
 * frames the Window builds, the fractional height the `text` shape takes, and
 * the component rendered into its pane. A Window it cannot render is therefore
 * unrepresentable rather than an empty box.
 *
 * The module is a leaf: it imports nothing from the app, so the Window host can
 * depend on the description without depending on a Feature.
 */
export interface WindowDescription {
  shape: 'text' | 'embed';
  height?: string;
  content: Type<unknown>;
}
