import { Observable } from 'rxjs';
import { coalescedSource } from './coalesced-source';

/**
 * Citation: Jordan Eldredge — Webamp (v2.3.1) [MIT]
 * Source: https://github.com/captbaritone/webamp/tree/v2.3.1
 * Accessed: 2026-09-26
 *
 * The geometry the engine's store speaks in. A window's `size` is not pixels
 * but increments of the skin's resize segment on top of a fixed base, doubled
 * in double-size mode, and a shaded window is its title bar's height. The
 * engine derives pixels the same way (`getWPixelSize`); these are the
 * documented base dimensions a reader of the store needs to do the same.
 */
const BASE_WIDTH = 275;
const BASE_HEIGHT = 116;
const SEGMENT_WIDTH = 25;
const SEGMENT_HEIGHT = 29;
const SHADE_HEIGHT = 14;

/**
 * One window, as the engine's store publishes it: whether it is open, how
 * large it is, where it sits in the engine's own pixel coordinates, and the
 * two layout flags (shade, double-size) that change its rendered size. Only
 * these fields are read, so a spec's box is enough where the engine would be.
 */
export interface WindowBox {
  open: boolean;
  shade?: boolean;
  canDouble?: boolean;
  size: [number, number];
  position: { x: number; y: number };
}

/** The engine's window map, keyed by the engine's window id. */
export interface WindowBoxes {
  [windowId: string]: WindowBox;
}

/** The union of the player's open windows: the rectangle the engine drags. */
export interface GroupSize {
  width: number;
  height: number;
}

/** A window's rendered size, from the store's size increments and flags. */
function pixelSize(
  window: WindowBox,
  doubled: boolean,
): { width: number; height: number } {
  const multiplier = doubled && window.canDouble ? 2 : 1;
  const height = window.shade
    ? SHADE_HEIGHT
    : BASE_HEIGHT + window.size[1] * SEGMENT_HEIGHT;
  return {
    width: (BASE_WIDTH + window.size[0] * SEGMENT_WIDTH) * multiplier,
    height: height * multiplier,
  };
}

/**
 * The smallest rectangle containing every open window, or `null` when none is
 * open: a closed player has no group to contain, and no floor is a floor of
 * zero.
 */
export function groupSize(
  windows: WindowBoxes,
  doubled = false,
): GroupSize | null {
  const open = Object.values(windows).filter((window) => window.open);
  if (open.length === 0) {
    return null;
  }
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const window of open) {
    const { width, height } = pixelSize(window, doubled);
    left = Math.min(left, window.position.x);
    top = Math.min(top, window.position.y);
    right = Math.max(right, window.position.x + width);
    bottom = Math.max(bottom, window.position.y + height);
  }
  return { width: right - left, height: bottom - top };
}

/**
 * The engine surface the group size is read from: one store read, one store
 * subscription. The engine's store stays the only authority on its windows.
 */
export interface WindowSource {
  windows(): WindowBoxes;
  doubled(): boolean;
  subscribe(onChange: () => void): () => void;
}

function sameGroup(a: GroupSize | null, b: GroupSize | null): boolean {
  if (a == null || b == null) {
    return a === b;
  }
  return a.width === b.width && a.height === b.height;
}

/**
 * The group size as a cache over the engine's store, through the shared
 * coalesced cache: the store notifies on every action, most of which move no
 * window, so the value dedupe keeps the mount node from being rewritten on
 * unrelated state.
 */
export function groupSize$(source: WindowSource): Observable<GroupSize | null> {
  return coalescedSource<GroupSize | null>({
    read: () => groupSize(source.windows(), source.doubled()),
    subscribe: (onChange) => source.subscribe(onChange),
    same: sameGroup,
  });
}
