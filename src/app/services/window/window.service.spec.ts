import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { WindowService } from './window.service';
import { MountService } from '../mount/mount';
import { WindowComponent } from '../../components/window/window.component';
import { DesktopBounds } from './desktop-bounds';
import { type Options } from './window.options';
import { Feature } from '../../../assets/applets/applet-definitions';

@Component({
  selector: 'app-window-host-stub',
  standalone: true,
  template: '',
})
class WindowStubContent {}

describe('WindowService', () => {
  let bounds: HTMLElement;
  let destroy: jest.Mock;
  let mount: jest.Mock;
  let service: WindowService;

  const optionsFor = (id: Feature, title: string): Options => ({
    id,
    title,
    window: { shape: 'text', height: '50%', content: WindowStubContent },
  });

  /** The cascade slots of the open Windows, in the order they were mounted. */
  const cascadeSlots = () =>
    Array.from(bounds.children).map((child) =>
      (child as HTMLElement).style.getPropertyValue('--cascade-n'),
    );

  /** The element the host mounted the Window into, for one mount call. */
  const mountedInto = (call: number): Element => mount.mock.calls[call][1];

  beforeEach(() => {
    bounds = document.createElement('div');
    destroy = jest.fn();
    mount = jest.fn(() => ({ destroy }));

    TestBed.configureTestingModule({
      providers: [
        { provide: MountService, useValue: { mount } },
        { provide: DesktopBounds, useValue: { element: bounds } },
      ],
    });
    service = TestBed.inject(WindowService);
  });

  it('mounts once when the same Feature is opened twice', () => {
    const options = optionsFor(Feature.About, 'About');

    service.open(options);
    service.open(options);

    expect(mount).toHaveBeenCalledTimes(1);
    expect(bounds.childElementCount).toBe(1);
  });

  it('mounts twice when two Features are opened', () => {
    service.open(optionsFor(Feature.About, 'About'));
    service.open(optionsFor(Feature.Weather, 'Weather'));

    expect(mount).toHaveBeenCalledTimes(2);
    expect(bounds.childElementCount).toBe(2);
    expect(service.openCount).toBe(2);
  });

  it('mounts the Window into the Desktop bounds, with the cascade slot on the element it mounts into', () => {
    service.open(optionsFor(Feature.About, 'About'));
    service.open(optionsFor(Feature.Weather, 'Weather'));

    expect(cascadeSlots()).toEqual(['0', '1']);
    expect(mount.mock.calls[0][0]).toBe(WindowComponent);
    expect(bounds.contains(mountedInto(0))).toBe(true);
    expect(bounds.contains(mountedInto(1))).toBe(true);
  });

  it('destroys the handle and removes the Window on close', () => {
    service.open(optionsFor(Feature.About, 'About'));

    service.close(Feature.About);

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(bounds.childElementCount).toBe(0);
    expect(service.openCount).toBe(0);
  });

  it('closes the front Window onto the most recently used survivor', () => {
    service.open(optionsFor(Feature.About, 'About'));
    service.open(optionsFor(Feature.Visualizer, 'Visualizer'));
    service.open(optionsFor(Feature.Weather, 'Weather'));

    service.raise(Feature.About); // a title-bar press
    expect(service.isActive(Feature.About)).toBe(true);

    service.close(Feature.About);

    expect(service.isActive(Feature.Weather)).toBe(true);
    expect(service.isActive(Feature.Visualizer)).toBe(false);
  });

  it('leaves nothing active when the last Window closes', () => {
    service.open(optionsFor(Feature.About, 'About'));
    service.close(Feature.About);

    expect(service.isActive(Feature.About)).toBe(false);
    expect(service.isActive(Feature.Weather)).toBe(false);
  });

  it('raises by moving the entry and nothing else, and raising the active Window is the identity', () => {
    service.open(optionsFor(Feature.About, 'About'));
    service.open(optionsFor(Feature.Weather, 'Weather'));
    service.open(optionsFor(Feature.Visualizer, 'Visualizer'));

    service.raise(Feature.About);

    expect(service.openCount).toBe(3);
    expect(mount).toHaveBeenCalledTimes(3);
    expect(cascadeSlots()).toEqual(['0', '1', '2']);
    expect(service.isActive(Feature.About)).toBe(true);

    service.raise(Feature.About);

    expect(service.isActive(Feature.About)).toBe(true);
    expect(service.openCount).toBe(3);
  });

  it('ignores a close for a Feature that has no Window open', () => {
    service.open(optionsFor(Feature.About, 'About'));

    service.close(Feature.Weather);

    expect(service.openCount).toBe(1);
    expect(destroy).not.toHaveBeenCalled();
  });
});
