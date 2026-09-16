import { type FeatureId } from '../feature/feature';
import { type WindowDescription } from '../feature/feature';

/**
 * What a Feature's activation hands the Window host: the identity the host keys
 * its at-most-one and Active Window rules on, the title the Window prints, and
 * the description the Window is built from.
 *
 * A Window with no Feature behind it — one the host could not key, raise or
 * close — is unrepresentable.
 */
export interface Options {
  id: FeatureId;
  title: string;
  window: WindowDescription;
}
