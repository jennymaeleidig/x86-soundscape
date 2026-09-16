import { ApplicationRef, Component, Input, inputBinding } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MountService } from './mount';

@Component({
  selector: 'app-mount-stub',
  standalone: true,
  template: 'stub:{{ label }}',
})
class MountStubComponent {
  @Input() label = '';
}

describe('MountService', () => {
  let target: HTMLElement;

  const mount = () => TestBed.inject(MountService);

  /** Runs the change detection the mount handle attached the view to. */
  const render = () => TestBed.inject(ApplicationRef).tick();

  beforeEach(() => {
    TestBed.configureTestingModule({});
    target = document.createElement('div');
    target.innerHTML = '<span>before</span><em>after</em>';
  });

  it('renders the component into the target beside its known children, with the bindings it was given', () => {
    mount().mount(MountStubComponent, target, [
      inputBinding('label', () => 'hello'),
    ]);
    render();

    expect(target.textContent).toContain('stub:hello');
    expect(target.querySelector('span')?.textContent).toBe('before');
    expect(target.querySelector('em')?.textContent).toBe('after');
  });

  it('leaves the target exactly as it was found, in the same order, after destroy()', () => {
    const found = target.innerHTML;
    const handle = mount().mount(MountStubComponent, target, [
      inputBinding('label', () => 'hello'),
    ]);
    render();

    handle.destroy();

    expect(target.innerHTML).toBe(found);
  });

  it('leaves the same state after a bindings-driven change', () => {
    const found = target.innerHTML;
    let label = 'first';
    const handle = mount().mount(MountStubComponent, target, [
      inputBinding('label', () => label),
    ]);
    render();
    label = 'second';
    render();
    expect(target.textContent).toContain('stub:second');

    handle.destroy();

    expect(target.innerHTML).toBe(found);
  });

  it('mounts and releases one component per call, so two mounts do not collide', () => {
    const first = mount().mount(MountStubComponent, target, [
      inputBinding('label', () => 'one'),
    ]);
    const second = mount().mount(MountStubComponent, target, [
      inputBinding('label', () => 'two'),
    ]);
    render();
    expect(target.textContent).toContain('stub:one');
    expect(target.textContent).toContain('stub:two');

    first.destroy();

    expect(target.textContent).toContain('stub:two');
    expect(target.textContent).not.toContain('stub:one');
    second.destroy();
  });
});
