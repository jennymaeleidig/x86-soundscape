import '../../../testing/jsdom-globals';

import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AppletComponent } from './applet.component';
import { FeatureId, type Feature } from '../../services/feature/feature';

const ICON = 'assets/images/ambience_off.png';
const TOOLTIP = 'Nothing playing';

describe('AppletComponent', () => {
  let fixture: ComponentFixture<AppletComponent>;
  let activate: jest.Mock;
  let setMoving: jest.Mock;
  let dragging: boolean;

  const feature = (): Feature => ({
    id: FeatureId.Ambience,
    title: 'Ambience',
    appearance: signal({ icon: ICON, tooltip: TOOLTIP }),
    activate,
  });

  const button = () => fixture.debugElement.query(By.css('button'));
  const icon = () => button().query(By.css('img')).nativeElement.src;

  /** The host's own mousedown, which a press inside the applet bubbles into. */
  const press = () => fixture.debugElement.triggerEventHandler('mousedown', {});

  beforeEach(() => {
    activate = jest.fn();
    setMoving = jest.fn();
    dragging = false;

    TestBed.configureTestingModule({
      providers: [
        { provide: 'appletIsMoving', useValue: setMoving },
        {
          provide: 'appletDragState',
          useValue: {
            isDragGesture: () => dragging,
            reset: () => {
              dragging = false;
            },
          },
        },
      ],
    });

    fixture = TestBed.createComponent(AppletComponent);
    fixture.componentInstance.feature = feature();
    fixture.detectChanges();
  });

  it('is one button showing the row it was handed, and nothing about the Feature is special-cased', () => {
    expect(fixture.debugElement.queryAll(By.css('button')).length).toBe(1);
    expect(icon()).toContain(ICON);
    expect(button().nativeElement.title).toBe(TOOLTIP);
    expect(fixture.nativeElement.textContent).toContain('Ambience');
  });

  it('activates the Feature exactly once on a double click', () => {
    button().triggerEventHandler('dblclick', {});

    expect(activate).toHaveBeenCalledTimes(1);
  });

  it('does not activate on a drag across the Desktop', () => {
    press(); // the gesture starts
    dragging = true; // and the Desktop marks it a drag

    button().triggerEventHandler('dblclick', {});

    expect(activate).not.toHaveBeenCalled();
  });

  it('clears the drag state the moment a new gesture starts, so the next click works', () => {
    press();
    dragging = true;
    button().triggerEventHandler('dblclick', {});

    press();
    button().triggerEventHandler('dblclick', {});

    expect(activate).toHaveBeenCalledTimes(1);
  });

  it('tells the Desktop the applet is moving on press and release', () => {
    button().triggerEventHandler('mousedown', {});
    button().triggerEventHandler('mouseup', {});

    expect(setMoving).toHaveBeenNthCalledWith(1, true);
    expect(setMoving).toHaveBeenNthCalledWith(2, false);
  });
});
