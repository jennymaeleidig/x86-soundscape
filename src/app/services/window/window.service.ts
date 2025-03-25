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
import { AppletTypes } from '../../../assets/applets/applet-definitions';

@Injectable({
  providedIn: 'root',
})
export class WindowService {
  //TODO: could combine these two vairables into one
  openWindows: ComponentRef<WindowComponent>[] = [];
  isOpen: Set<AppletTypes> = new Set<AppletTypes>();
  options!: Options;
  activeWindow: AppletTypes = AppletTypes.Default;
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

  close(selector: AppletTypes) {
    //TODO: Change to use renderer pattern
    this.openWindows[selector].location.nativeElement.remove();
    delete this.openWindows[selector];
    this.isOpen.delete(selector);
  }

  setActiveWindow(selector: AppletTypes) {
    this.activeWindow = selector;
  }

  getActiveWindow() {
    return this.activeWindow;
  }
}
