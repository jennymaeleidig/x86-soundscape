import {
  ApplicationRef,
  EnvironmentInjector,
  Injectable,
  createComponent,
  type Binding,
  type Type,
} from '@angular/core';

/**
 * What a caller holds after mounting: one way to take the component back off
 * the page. Nothing else is retained, so there is nothing else to detach.
 */
export interface MountHandle {
  /**
   * Leaves the target exactly as it was found — the same children, in the same
   * order — whatever the component did in between.
   */
  destroy(): void;
}

/**
 * Puts a component into a given element with the given bindings, and hands back
 * the handle that takes it away again. It knows a component type, an element
 * and bindings, and nothing about Features, Windows, Pop-ups, cascading,
 * "active" or "at most one": those rules belong to its callers.
 *
 * The component's own host element is created here rather than taken from the
 * caller, because Angular clears the element it is handed as a host — a target
 * with children of its own would lose them. Mounting therefore adds one element
 * to the target, and `destroy()` removes exactly that one.
 */
@Injectable({ providedIn: 'root' })
export class MountService {
  constructor(
    private readonly appRef: ApplicationRef,
    private readonly injector: EnvironmentInjector,
  ) {}

  mount<C>(
    component: Type<C>,
    target: Element,
    bindings: Binding[] = [],
  ): MountHandle {
    const ref = createComponent(component, {
      environmentInjector: this.injector,
      bindings,
    });
    this.appRef.attachView(ref.hostView);
    target.appendChild(ref.location.nativeElement);

    return {
      destroy: () => {
        this.appRef.detachView(ref.hostView);
        const element: Element = ref.location.nativeElement;
        ref.destroy();
        element.remove();
      },
    };
  }
}
