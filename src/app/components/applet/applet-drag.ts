/**
 * The Desktop–Applet drag seam. The Desktop provides one for the Applets it
 * renders; an Applet reports its press and release through it and asks whether
 * the gesture became a drag before it activates its Feature.
 */
export abstract class AppletDrag {
  /** Whether the gesture in progress turned into a drag across the Desktop. */
  abstract isDragGesture(): boolean;

  /** Marks the start of a new gesture, clearing the last drag's answer. */
  abstract beginGesture(): void;

  /** Tells the Desktop the Applet is moving, so drag-select stands down. */
  abstract setMoving(moving: boolean): void;
}
