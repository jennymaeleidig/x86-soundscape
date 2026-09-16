import { TestBed } from '@angular/core/testing';

import { DesktopComponent } from './desktop.component';
import { FeatureRegistry } from '../../services/feature/feature-registry';
import { WindowService } from '../../services/window/window.service';
import { WinampService } from '../../services/winamp/winamp.service';
import { AmbienceService } from '../../services/ambience/ambience';

/**
 * The Desktop's copy is a plain transformation of the registry's rows, so it is
 * exercised against the real registry rather than through a rendered Desktop: a
 * fixture would drag in the Menu, the player and the drag-select library for a
 * fact about two fields.
 */
describe('DesktopComponent', () => {
  let registry: FeatureRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: WindowService, useValue: { open: jest.fn() } },
        {
          provide: WinampService,
          useValue: { reopenWinamp: jest.fn(), playRadio: jest.fn() },
        },
        { provide: AmbienceService, useValue: { toggle: jest.fn() } },
      ],
    });
    registry = TestBed.inject(FeatureRegistry);
  });

  const desktop = () => {
    const component = new DesktopComponent({ element: null }, registry);
    component.ngOnInit();
    return component;
  };

  it('copies each row into its own position-carrying object and passes the row through', () => {
    const rows = registry.features;

    const component = desktop();

    expect(component.applets.length).toBe(rows.length);
    component.applets.forEach((applet, index) => {
      expect(applet).not.toBe(rows[index]);
      expect(applet.feature).toBe(rows[index]);
      expect(applet.x).toBe(0);
      expect(applet.y).toBe(0);
      expect(component.getAppletInputs(applet)).toEqual({
        feature: rows[index],
      });
    });
  });

  it('keeps the identity matchable after the copy, which is why the key is apart from the value', () => {
    const component = desktop();

    for (const applet of component.applets) {
      // A lookup keyed on the copy would miss; keyed on the identity it finds
      // the very row the Desktop copied.
      expect(
        registry.features.find((row) => row.id === applet.feature.id),
      ).toBe(applet.feature);
    }
  });
});
