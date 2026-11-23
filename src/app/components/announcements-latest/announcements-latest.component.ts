import { Component } from '@angular/core';
import { announcements } from '../announcements/announcements';

/**
 * The latest entry from the Announcements list, in the Pop-up's small shape.
 * It reads the same static list the Announcements Window renders, so there is
 * one list and the Pop-up never grows to show all of it.
 */
@Component({
  selector: 'app-announcements-latest',
  standalone: true,
  templateUrl: './announcements-latest.component.html',
})
export class AnnouncementsLatestComponent {
  readonly announcement = announcements[0];
}
