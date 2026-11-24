import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  signal,
  OnInit,
} from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { WinampComponent } from '../winamp/winamp.component';
import { AppletComponent } from '../applet/applet.component';
import { AppletDrag } from '../applet/applet-drag';
import { DesktopBounds } from '../../services/window/desktop-bounds';
import {
  DragToSelectModule,
  SelectContainerComponent,
} from 'ngx-drag-to-select';

import {
  CdkDrag,
  CdkDragMove,
  CdkDragEnd,
  Point,
} from '@angular/cdk/drag-drop';
import { type Feature } from '../../services/feature/feature';
import { FeatureRegistry } from '../../services/feature/feature-registry';

/** One row plus the position the Desktop carries for it. */
interface DesktopApplet {
  feature: Feature;
  x: number;
  y: number;
}

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [
    MenuComponent,
    WinampComponent,
    DragToSelectModule,
    CdkDrag,
    AppletComponent,
  ],
  templateUrl: './desktop.component.html',
  styleUrl: './desktop.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [{ provide: AppletDrag, useExisting: DesktopComponent }],
})
export class DesktopComponent implements AfterViewInit, AppletDrag, OnInit {
  @ViewChild('container') selectContainer!: SelectContainerComponent;
  @ViewChild('container', { read: ElementRef }) containerRef!: ElementRef;
  @ViewChild('bounds') bounds!: ElementRef<HTMLElement>;

  selectedApplets: DesktopApplet[] = [];
  console = console;
  applets: DesktopApplet[] = [];
  /** Zoneless: the select container stands down through this signal's write. */
  readonly appletIsMoving = signal(false);

  // Track drag state
  private dragStartPositions = new Map<DesktopApplet, Point>();
  dragGestureActive = false;

  constructor(
    private readonly desktopBounds: DesktopBounds,
    private readonly features: FeatureRegistry,
  ) {}

  ngAfterViewInit() {
    // The Window host is root-provided, so the bounds travel as a value rather
    // than as a provider in the Desktop's own injector scope.
    this.desktopBounds.element = this.bounds.nativeElement;
    // Set here rather than as a template binding: the two-way selectedItems
    // binding desynchronizes the binding slots of the inputs after it, so a
    // [selectOnClick] binding never reaches the container.
    this.selectContainer.selectOnClick = false;
  }

  ngOnInit() {
    // Every row gets a position of its own; the row itself is passed through
    // untouched, so the identity the Window host keys on survives the copy.
    this.applets = this.features.features.map((feature) => ({
      feature,
      x: 0,
      y: 0,
    }));
  }

  onDragStarted(applet: DesktopApplet) {
    this.dragGestureActive = true;

    // If the dragged applet is not selected, clear selection and select only this one
    if (!this.selectedApplets.includes(applet)) {
      this.selectedApplets = [applet];
    }

    // Snapshot starting positions of all selected items
    this.dragStartPositions.clear();
    this.selectedApplets.forEach((selectedApplet) => {
      this.dragStartPositions.set(selectedApplet, {
        x: selectedApplet.x,
        y: selectedApplet.y,
      });
    });
  }

  onDragMoved(event: CdkDragMove, applet: DesktopApplet) {
    // Update positions of OTHER selected items (not the actively dragged one)
    const delta = event.distance;

    this.selectedApplets.forEach((selectedApplet) => {
      if (selectedApplet !== applet) {
        const startPos = this.dragStartPositions.get(selectedApplet);
        if (startPos) {
          selectedApplet.x = startPos.x + delta.x;
          selectedApplet.y = startPos.y + delta.y;
        }
      }
    });
  }

  onDragEnded(event: CdkDragEnd, _applet: DesktopApplet) {
    // Get the actual final position from the drag source element
    // This respects the boundary constraints
    const element = event.source.element.nativeElement;
    const transform = element.style.transform;

    // Parse the transform to get actual delta (respecting boundaries)
    const actualDelta = { x: 0, y: 0 };
    if (transform && transform !== 'none') {
      const match = transform.match(
        /translate3d\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px/,
      );
      if (match) {
        actualDelta.x = parseFloat(match[1]);
        actualDelta.y = parseFloat(match[2]);
      }
    }

    // Update all selected applets' final positions using the actual constrained delta
    this.selectedApplets.forEach((selectedApplet) => {
      const startPos = this.dragStartPositions.get(selectedApplet);
      if (startPos) {
        selectedApplet.x = startPos.x + actualDelta.x;
        selectedApplet.y = startPos.y + actualDelta.y;
      }
    });

    // Reset the cdkDrag transform back to 0,0 so it doesn't interfere with next drag
    event.source.reset();

    // Clear drag state
    this.dragStartPositions.clear();

    // Force the drag-select library to recalculate element positions
    setTimeout(() => {
      if (this.selectContainer) {
        this.selectContainer.update();
      }
    }, 50);
  }

  /** The Desktop's side of the drag seam its Applets inject. */
  isDragGesture() {
    return this.dragGestureActive;
  }

  beginGesture() {
    this.dragGestureActive = false;
  }

  setMoving(moving: boolean) {
    this.appletIsMoving.set(moving);
  }

  isSelected(applet: DesktopApplet): boolean {
    return this.selectedApplets.includes(applet);
  }
}
