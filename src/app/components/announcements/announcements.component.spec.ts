import { TestBed } from '@angular/core/testing';

import { AnnouncementsComponent } from './announcements.component';

describe('AnnouncementsComponent', () => {
  it('renders every announcement it owns, with no Window around it', () => {
    const fixture = TestBed.createComponent(AnnouncementsComponent);

    fixture.detectChanges();

    const entries = fixture.nativeElement.querySelectorAll('.grid > div');
    expect(entries.length).toBe(AnnouncementsComponent.announcements.length);
    expect(entries[0].textContent).toContain('Upadates! Updates!! Updates!!!');
    expect(fixture.nativeElement.querySelector('.window')).toBeNull();
  });
});
