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

@Injectable({
  providedIn: 'root',
})
export class WindowService {
  newWindowComponent!: ComponentRef<WindowComponent>;
  options!: Options | undefined;
  //TODO: allow for more than one different window to be open at once
  isOpen: boolean = false;
  private renderer: Renderer2;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
    private rendererFactory: RendererFactory2,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  // Function implementation
  open<C>(options?: Options) {
    if (!this.isOpen) {
      this.openWithComponent();
      this.isOpen = true;
      this.options = options;
    }
  }

  private openWithComponent() {
    // create the desired component, the content of the window
    this.newWindowComponent = createComponent(WindowComponent, {
      environmentInjector: this.injector,
      // projectableNodes: [[newComponent.location.nativeElement]],
    });

    // document.body.appendChild(this.newWindowComponent.location.nativeElement);
    this.renderer.appendChild(
      document.body.querySelector('.desktop-bounds'),
      this.newWindowComponent.location.nativeElement,
    );

    // Attach views to the changeDetection cycle
    this.appRef.attachView(this.newWindowComponent.hostView);
  }

  close() {
    this.isOpen = false;
    //TODO: Change to use renderer pattern
    this.newWindowComponent.location.nativeElement.remove();
  }
}
