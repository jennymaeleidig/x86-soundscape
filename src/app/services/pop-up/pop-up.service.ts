import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Injectable, Type, ViewContainerRef } from '@angular/core';
import { PopUpComponent } from '../../components/pop-up/pop-up.component';
import { Options } from './pop-up.options';

@Injectable({
  providedIn: 'root'
})
export class PopUpService {
  newPopUpComponent!: ComponentRef<PopUpComponent>
  options!: Options | undefined;
  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) { }

  // Function implementation
  open<C>(
    popUpComponent:Type<C>,
    options?: Options
  ) {
      this.openWithComponent(popUpComponent);
      // Same story here : for the second approach, the second param will be of type Options or undefined, since optional 
      this.options = options
    }

  private openWithComponent(component: Type<unknown>) {
    // create the desired component, the content of the modal box
    const newComponent = createComponent(component, {
      environmentInjector: this.injector,
    });
    // create the modal component and project the instance of the desired component in the ng-content
    this.newPopUpComponent = createComponent(PopUpComponent, {
      environmentInjector: this.injector,
      projectableNodes: [[newComponent.location.nativeElement]],
    });

    document.body.appendChild(this.newPopUpComponent.location.nativeElement);

    // Attach views to the changeDetection cycle
    this.appRef.attachView(newComponent.hostView);
    this.appRef.attachView(this.newPopUpComponent.hostView);
  }

  close() {
    this.newPopUpComponent.instance.close();
  }
}
