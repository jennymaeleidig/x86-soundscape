import { TestBed } from '@angular/core/testing';

import { AnnouncementsLatestComponent } from './announcements-latest.component';
import { AnnouncementsComponent } from '../announcements/announcements.component';

describe('AnnouncementsLatestComponent', () => {
  it('renders only the latest entry from the list the Announcements Window shows', () => {
    const fixture = TestBed.createComponent(AnnouncementsLatestComponent);

    fixture.detectChanges();

    const [latest, previous] = AnnouncementsComponent.announcements;
    expect(fixture.nativeElement.querySelectorAll('.grid').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain(latest.title);
    expect(fixture.nativeElement.textContent).toContain(latest.date);
    expect(fixture.nativeElement.textContent).toContain(latest.msg);
    expect(fixture.nativeElement.textContent).not.toContain(previous.title);
  });
});
