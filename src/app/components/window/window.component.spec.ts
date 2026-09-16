import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { WindowComponent } from './window.component';

@Component({
  selector: 'app-window-stub',
  standalone: true,
  template: 'stub content',
})
class WindowStubContent {}

describe('WindowComponent', () => {
  let fixture: ComponentFixture<WindowComponent>;

  /** Renders the Window with everything handed in, the way a host hands it in. */
  const show = (
    title: string,
    shape: 'text' | 'embed',
    height?: string,
    isActive = false,
  ) => {
    fixture.componentRef.setInput('title', title);
    fixture.componentRef.setInput('shape', shape);
    fixture.componentRef.setInput('height', height);
    fixture.componentRef.setInput('content', WindowStubContent);
    fixture.componentRef.setInput('isActive', isActive);
    fixture.detectChanges();
  };

  const frame = () => fixture.debugElement.query(By.css('.window'));
  const pane = () => fixture.debugElement.query(By.css('.window-pane'));

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [WindowComponent] });
    fixture = TestBed.createComponent(WindowComponent);
  });

  it('prints exactly the title it was given, and renders the component it was handed once', () => {
    show('Weather', 'embed');

    expect(
      fixture.debugElement.query(By.css('.title')).nativeElement.textContent,
    ).toBe('Weather');
    expect(pane().nativeElement.textContent).toContain('stub content');
  });

  it('builds the text frame as a fractional-height, resizable pane with padding', () => {
    show('About', 'text', '50%');

    expect(frame().nativeElement.classList).toContain('w-[min(25%,90vw)]');
    expect(frame().nativeElement.classList).toContain('resize');
    expect(frame().nativeElement.style.height).toBe('50%');
    expect(pane().nativeElement.classList).not.toContain('!p-px');
  });

  it('builds the embed frame as auto-sized, capped at the viewport width, bleeding to the edge', () => {
    show('Weather', 'embed');

    expect(frame().nativeElement.classList).toContain('max-w-[90vw]');
    expect(frame().nativeElement.classList).not.toContain('resize');
    expect(frame().nativeElement.style.height).toBe('');
    expect(pane().nativeElement.classList).toContain('!p-px');
  });

  it('raises onClose from the close button and onActivate from the title bar', () => {
    show('About', 'text', '50%');
    const closed = jest.fn();
    const activated = jest.fn();
    fixture.componentInstance.onClose.subscribe(closed);
    fixture.componentInstance.onActivate.subscribe(activated);

    fixture.debugElement
      .query(By.css('.close'))
      .triggerEventHandler('click', {});
    fixture.debugElement
      .query(By.css('.title-bar, .inactive-title-bar'))
      .triggerEventHandler('mousedown', {});

    expect(closed).toHaveBeenCalledTimes(1);
    expect(activated).toHaveBeenCalledTimes(1);
  });

  it('follows isActive in the active class pair', () => {
    show('About', 'text', '50%', false);
    expect(frame().nativeElement.classList).toContain('z-0');
    expect(
      fixture.debugElement.query(By.css('.inactive-title-bar')),
    ).toBeTruthy();

    show('About', 'text', '50%', true);
    expect(frame().nativeElement.classList).toContain('z-5');
    expect(fixture.debugElement.query(By.css('.title-bar'))).toBeTruthy();
  });
});
