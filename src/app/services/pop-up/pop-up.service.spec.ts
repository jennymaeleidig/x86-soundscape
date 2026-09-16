import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PopUpService } from './pop-up.service';
import { MountService } from '../mount/mount';
import { PopUpComponent } from '../../components/pop-up/pop-up.component';
import { type Options } from './pop-up.options';
import { FeatureId } from '../feature/feature';

describe('PopUpService', () => {
  const aboutOptions = (): Options => ({
    id: FeatureId.About,
    contents: 'All about it',
  });
  const announcementsOptions = (): Options => ({
    id: FeatureId.Announcements,
    contents: [{ title: 'Big news', date: 'today', msg: 'It shipped' }],
  });

  describe('with the real mount module', () => {
    let service: PopUpService;

    beforeEach(() => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(PopUpService);
    });

    /** A mounted view shows in the DOM only once change detection runs. */
    const open = (options: Options) => {
      service.open(options);
      TestBed.inject(ApplicationRef).tick();
    };

    /** Presses Escape on the document, as the user does. */
    const pressEscape = () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      TestBed.inject(ApplicationRef).tick();
    };

    it('mounts the Pop-up into the document body, so it overlays the page', () => {
      open(aboutOptions());

      expect(document.body.querySelector('app-pop-up')).not.toBeNull();
    });

    it('the identity and contents arrive as bindings, not a service read-back', () => {
      open(aboutOptions());

      const text = document.body.querySelector('app-pop-up')?.textContent ?? '';
      expect(text).toContain('About');
      expect(text).toContain('All about it');
    });

    it('the Announcements shape shows the latest entry', () => {
      open(announcementsOptions());

      const text = document.body.querySelector('app-pop-up')?.textContent ?? '';
      expect(text).toContain('Big news');
      expect(text).toContain('It shipped');
    });

    it('Escape dismisses it, and a later Escape runs nothing of the dismissed Pop-up', () => {
      open(aboutOptions());

      pressEscape();
      expect(document.body.querySelector('app-pop-up')).toBeNull();

      const close = jest.spyOn(service, 'close');
      pressEscape();
      expect(close).not.toHaveBeenCalled();
    });

    it('a close destroys the component and its DOM', () => {
      open(aboutOptions());
      service.close();

      expect(document.body.querySelector('app-pop-up')).toBeNull();
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
      service.open(aboutOptions());
      service.open(announcementsOptions());

      expect(mount).toHaveBeenCalledTimes(2);
      expect(destroy).toHaveBeenCalledTimes(1);
    });

    it('a close destroys the handle, and nothing is left to close again', () => {
      service.open(aboutOptions());
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
