import { Component, Injector, ViewChild, ElementRef } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { WinampComponent } from '../winamp/winamp.component';
import { AppletComponent } from '../applet/applet.component';
import {
  DragToSelectModule,
  SelectContainerComponent,
} from 'ngx-drag-to-select';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import {
  CdkDrag,
  CdkDragStart,
  CdkDragMove,
  CdkDragEnd,
  Point,
} from '@angular/cdk/drag-drop';
import AppletDefinitions, {
  AppletDefinition,
} from '../../../assets/applets/applet-definitions';
import { DeviceDetectorService } from 'ngx-device-detector';

interface DesktopApplet extends AppletDefinition {
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
    CommonModule,
    NgComponentOutlet,
    CdkDrag,
  ],
  templateUrl: './desktop.component.html',
  styleUrl: './desktop.component.css',
})
export class DesktopComponent {
  @ViewChild('container') selectContainer!: SelectContainerComponent;
  @ViewChild('container', { read: ElementRef }) containerRef!: ElementRef;

  selectedApplets: Array<DesktopApplet> = [];
  AppletComponent = AppletComponent;
  console = console;
  applets: DesktopApplet[] = [];
  appletIsMoving: boolean = false;

  // Track drag state
  private dragStartPositions: Map<DesktopApplet, Point> = new Map();
  private activelyDraggedApplet: DesktopApplet | null = null;

  injector = Injector.create({
    providers: [
      {
        provide: 'appletIsMoving',
        useValue: (data: boolean) => this.setAppletIsMoving(data),
      },
    ],
  });

  constructor(private deviceService: DeviceDetectorService) {}

  ngOnInit() {
    // Initialize applets with position data
    this.applets = AppletDefinitions.appletDefinitions.map((def) => ({
      ...def,
      x: 0,
      y: 0,
    }));
  }

  setAppletIsMoving(data: boolean) {
    this.appletIsMoving = data;
  }

  isMobileRes(): boolean {
    return this.deviceService.isMobile();
  }

  onDragStarted(event: CdkDragStart, applet: DesktopApplet) {
    this.activelyDraggedApplet = applet;

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

  onDragEnded(event: CdkDragEnd, applet: DesktopApplet) {
    // Get the actual final position from the drag source element
    // This respects the boundary constraints
    const element = event.source.element.nativeElement;
    const transform = element.style.transform;

    // Parse the transform to get actual delta (respecting boundaries)
    let actualDelta = { x: 0, y: 0 };
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
    this.activelyDraggedApplet = null;

    // Force the drag-select library to recalculate element positions
    setTimeout(() => {
      if (this.selectContainer) {
        this.selectContainer.update();
      }
    }, 50);
  }

  isSelected(applet: DesktopApplet): boolean {
    return this.selectedApplets.includes(applet);
  }

  getAppletInputs(applet: DesktopApplet): AppletDefinition {
    // Extract only AppletDefinition properties, excluding position data
    const { x, y, ...appletDefinition } = applet;
    return appletDefinition as AppletDefinition;
  }
}
