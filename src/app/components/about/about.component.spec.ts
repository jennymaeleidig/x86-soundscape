import { TestBed } from '@angular/core/testing';

import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  it('renders its own text with no Window around it', () => {
    const fixture = TestBed.createComponent(AboutComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('x86 Soundscape');
    expect(fixture.nativeElement.querySelector('.window')).toBeNull();
  });
});
