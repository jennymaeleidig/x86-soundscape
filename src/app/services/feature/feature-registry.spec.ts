import { TestBed } from '@angular/core/testing';

import { FeatureRegistry } from './feature-registry';
import { FeatureId } from './feature';
import { WindowService } from '../window/window.service';
import { WinampService } from '../winamp/winamp.service';
import { AmbienceService } from '../ambience/ambience';

describe('FeatureRegistry', () => {
  let open: jest.Mock;
  let reopenWinamp: jest.Mock;
  let playRadio: jest.Mock;
  let toggleAmbience: jest.Mock;

  const registry = () => TestBed.inject(FeatureRegistry);
  const row = (id: FeatureId) => registry().features.find((f) => f.id === id)!;

  beforeEach(() => {
    open = jest.fn();
    reopenWinamp = jest.fn();
    playRadio = jest.fn();
    toggleAmbience = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        { provide: WindowService, useValue: { open } },
        { provide: WinampService, useValue: { reopenWinamp, playRadio } },
        { provide: AmbienceService, useValue: { toggle: toggleAmbience } },
      ],
    });
  });

  it('builds seven rows, each with an identity of its own', () => {
    const ids = registry().features.map((feature) => feature.id);

    expect(ids.length).toBe(7);
    expect(new Set(ids).size).toBe(7);
  });

  it('gives every row a title and a readable appearance', () => {
    for (const feature of registry().features) {
      expect(feature.title).toBeTruthy();
      expect(feature.appearance().icon).toBeTruthy();
    }
  });

  it('names a shape and a content for every row that has a Window, so a Feature the Window cannot render is unrepresentable', () => {
    const withWindow = registry().features.filter((feature) => feature.window);

    expect(withWindow.length).toBe(4);
    for (const feature of withWindow) {
      expect(['text', 'embed']).toContain(feature.window!.shape);
      expect(feature.window!.content).toBeTruthy();
    }
  });

  it('leaves the three Actions with no Window at all', () => {
    const actions = registry()
      .features.filter((feature) => !feature.window)
      .map((feature) => feature.id);

    expect(actions).toEqual([
      FeatureId.Webamp,
      FeatureId.PlayRadio,
      FeatureId.Ambience,
    ]);
  });

  it('opens each Window row through the host, with the title and Window description the row carries', () => {
    const windowRows = registry().features.filter((feature) => feature.window);

    for (const feature of windowRows) {
      feature.activate();
    }

    expect(open.mock.calls.map(([options]) => options)).toEqual(
      windowRows.map((feature) => ({
        id: feature.id,
        title: feature.title,
        window: feature.window,
      })),
    );
  });

  it('turns the three Actions into the calls they name, never into an open', () => {
    row(FeatureId.Webamp).activate();
    row(FeatureId.PlayRadio).activate();
    row(FeatureId.Ambience).activate();

    expect(reopenWinamp).toHaveBeenCalledTimes(1);
    expect(playRadio).toHaveBeenCalledTimes(1);
    expect(toggleAmbience).toHaveBeenCalledTimes(1);
    expect(open).not.toHaveBeenCalled();
  });

  it('leaves every activate callable without throwing', () => {
    for (const feature of registry().features) {
      expect(() => feature.activate()).not.toThrow();
    }
  });
});
