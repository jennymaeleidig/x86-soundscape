import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PopUpService } from './pop-up.service';
import { MountService } from '../mount/mount';
import { FeatureId } from '../feature/feature';
import { announcements } from '../../components/announcements/announcements';

describe('PopUpService', () => {
  describe('with the real mount module', () => {
    let service: PopUpService;

    beforeEach(() => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(PopUpService);
    });

    /** A mounted view shows in the DOM only once change detection runs. */
    const open = (id: FeatureId) => {
      service.open(id);
      TestBed.inject(ApplicationRef).tick();
    };

    const popUp = (): Element | null =>
      document.body.querySelector('app-pop-up');

    /** Presses Escape on the document, as the user does. */
    const pressEscape = () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      TestBed.inject(ApplicationRef).tick();
    };

    it('mounts the Pop-up into the document body, so it overlays the page', () => {
      open(FeatureId.About);

      expect(popUp()).not.toBeNull();
    });

    it("mounts the Feature's own content component, the way the Window host does", () => {
      open(FeatureId.About);

      expect(popUp()?.querySelector('app-about')).not.toBeNull();
    });

    it('shows the About text under its own heading', () => {
      open(FeatureId.About);

      const text = popUp()?.textContent ?? '';
      expect(text).toContain('About');
      expect(text).toContain('x86 Soundscape');
    });

    it('shows only the latest announcement, from the same list the Window shows', () => {
      open(FeatureId.Announcements);

      const popUpText = popUp()?.textContent ?? '';
      const [latest, previous] = announcements;
      expect(popUpText).toContain('Latest');
      expect(popUpText).toContain(latest.title);
      expect(popUpText).toContain(latest.msg);
      expect(popUpText).not.toContain(previous.title);
    });

    it('the OK button dismisses it', () => {
      open(FeatureId.About);

      const ok = Array.from(popUp()?.querySelectorAll('button') ?? []).find(
        (button) => button.textContent?.trim() === 'OK',
      );
      ok?.click();
      TestBed.inject(ApplicationRef).tick();

      expect(popUp()).toBeNull();
    });

    it('a backdrop click dismisses it', () => {
      open(FeatureId.About);

      popUp()?.firstElementChild?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
      TestBed.inject(ApplicationRef).tick();

      expect(popUp()).toBeNull();
    });

    it('Escape dismisses it, and a later Escape runs nothing of the dismissed Pop-up', () => {
      open(FeatureId.About);

      pressEscape();
      expect(popUp()).toBeNull();

      const close = jest.spyOn(service, 'close');
      pressEscape();
      expect(close).not.toHaveBeenCalled();
    });

    it('a close destroys the component and its DOM', () => {
      open(FeatureId.About);
      service.close();

      expect(popUp()).toBeNull();
    });
  });

  describe('with the mount module mocked, for the at-most-one rule', () => {
    let destroy: jest.Mock;
    let mount: jest.Mock;
    let service: PopUpService;

    beforeEach(() => {
      destroy = jest.fn();
      mount = jest.fn().mockReturnValue({ destroy });

      TestBed.configureTestingModule({
        providers: [{ provide: MountService, useValue: { mount } }],
      });
      service = TestBed.inject(PopUpService);
    });

    it('keeps at most one Pop-up open: opening another destroys the one it replaces', () => {
      service.open(FeatureId.About);
      service.open(FeatureId.Announcements);

      expect(mount).toHaveBeenCalledTimes(2);
      expect(destroy).toHaveBeenCalledTimes(1);
    });

    it('a close destroys the handle, and nothing is left to close again', () => {
      service.open(FeatureId.About);
      service.close();
      service.close();

      expect(destroy).toHaveBeenCalledTimes(1);
    });

    it('ignores a close when no Pop-up is open', () => {
      service.close();

      expect(destroy).not.toHaveBeenCalled();
    });
  });
});
