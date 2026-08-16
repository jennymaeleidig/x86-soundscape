import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
  Renderer2,
  RendererFactory2,
} from '@angular/core';
import { WindowComponent } from '../../components/window/window.component';
import { Options } from './window.options';
import { Feature } from '../../../assets/applets/applet-definitions';

@Injectable({
  providedIn: 'root',
})
export class WindowService {
  //TODO: could combine these two vairables into one
  openWindows: ComponentRef<WindowComponent>[] = [];
  isOpen: Set<Feature> = new Set<Feature>();
  options!: Options;
  // Open-order cascade state. openCount reflects currently-open windows
  // (decremented on close, not lifetime opens) so reopening after a close
  // doesn't push windows progressively off-screen. cascadeIndex is the
  // slot assigned to the window being opened; the WindowComponent reads it
  // at creation time and applies it as the --cascade-n CSS custom property.
  openCount = 0;
  cascadeIndex = 0;
  activeWindow: Feature = Feature.None;
  private renderer: Renderer2;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
    rendererFactory: RendererFactory2,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  // Function implementation
  open(options: Options) {
    if (!this.isOpen.has(options.selector)) {
      this.options = options;
      this.cascadeIndex = this.openCount;
      this.openCount++;
      this.openWithComponent();
      this.isOpen.add(this.options.selector);
      this.activeWindow = this.options.selector;
    }
  }

  private openWithComponent() {
    // create the desired component, the content of the window
    this.openWindows[this.options.selector] = createComponent(WindowComponent, {
      environmentInjector: this.injector,
    });

    this.renderer.appendChild(
      document.body.querySelector('.desktop-bounds'),
      this.openWindows[this.options.selector].location.nativeElement,
    );

    // Attach views to the changeDetection cycle
    this.appRef.attachView(this.openWindows[this.options.selector].hostView);
  }

  close(selector: Feature) {
    //TODO: Change to use renderer pattern
    this.openWindows[selector].location.nativeElement.remove();
    delete this.openWindows[selector];
    this.isOpen.delete(selector);
    this.openCount = Math.max(0, this.openCount - 1);
  }

  setActiveWindow(selector: Feature) {
    this.activeWindow = selector;
  }

  getActiveWindow() {
    return this.activeWindow;
  }
}
