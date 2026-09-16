import { Injectable } from '@angular/core';

/**
 * The Desktop's bounds element, published to the root injector rather than
 * provided in the Desktop's own scope: the Window host is root-provided — the
 * Feature registry injects it — so the Desktop is not an ancestor of the host
 * in the injector tree, and a token provided beside the Desktop would never
 * reach it. The Desktop sets this once its view is up; nothing else writes it.
 */
@Injectable({ providedIn: 'root' })
export class DesktopBounds {
  element: HTMLElement | null = null;
}
