import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
} from '@angular/core';
import { PopUpComponent } from '../../components/pop-up/pop-up.component';
import { Options } from './pop-up.options';

@Injectable({
  providedIn: 'root',
})
export class PopUpService {
  newPopUpComponent!: ComponentRef<PopUpComponent>;
  options!: Options;
  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
  ) {}

  // Function implementation
  open(options: Options) {
    this.openWithComponent();
    this.options = options;
  }

  private openWithComponent() {
    // create the modal component and project the instance
    this.newPopUpComponent = createComponent(PopUpComponent, {
      environmentInjector: this.injector,
    });

    //TODO: convert to renderer2 pattern
    document.body.appendChild(this.newPopUpComponent.location.nativeElement);

    // Attach views to the changeDetection cycle
    this.appRef.attachView(this.newPopUpComponent.hostView);
  }

  close() {
    this.newPopUpComponent.instance.close();
  }
}
