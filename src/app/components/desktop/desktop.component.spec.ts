import { signal } from '@angular/core';

import { DesktopComponent } from './desktop.component';
import { DesktopBounds } from '../../services/window/desktop-bounds';
import { FeatureRegistry } from '../../services/feature/feature-registry';
import { FeatureId, type Feature } from '../../services/feature/feature';

/**
 * The Desktop's copy is a plain value transformation, so it is exercised
 * directly rather than through TestBed: rendering the Desktop would drag in the
 * Menu, the player and the drag-select library for a fact about two fields.
 */
describe('DesktopComponent', () => {
  const row = (id: FeatureId, title: string): Feature => ({
    id,
    title,
    appearance: signal({ icon: 'assets/images/Note.png' }),
    activate: jest.fn(),
  });

  const desktopFor = (features: Feature[]): DesktopComponent => {
    const desktop = new DesktopComponent(
      { element: null } as DesktopBounds,
      { features } as unknown as FeatureRegistry,
    );
    desktop.ngOnInit();
    return desktop;
  };

  it('copies each row into its own position-carrying object and passes the row through', () => {
    const about = row(FeatureId.About, 'About');

    const desktop = desktopFor([about]);

    expect(desktop.applets.length).toBe(1);
    expect(desktop.applets[0]).not.toBe(about);
    expect(desktop.applets[0].feature).toBe(about);
    expect(desktop.applets[0].x).toBe(0);
    expect(desktop.applets[0].y).toBe(0);
    expect(desktop.getAppletInputs(desktop.applets[0])).toEqual({
      feature: about,
    });
  });

  it('keeps the identity matchable after the copy, which is why the key is apart from the value', () => {
    const rows = [
      row(FeatureId.About, 'About'),
      row(FeatureId.Weather, 'Weather'),
    ];

    const desktop = desktopFor(rows);
    const copies = desktop.applets.map((applet) => applet.feature);

    // A lookup keyed on the copy itself would now miss; keyed on the identity
    // it still finds the row the Desktop copied.
    expect(copies[0]).not.toBe(desktop.applets[0]);
    for (const copy of copies) {
      expect(rows.find((candidate) => candidate.id === copy.id)).toBe(copy);
    }
  });
});
