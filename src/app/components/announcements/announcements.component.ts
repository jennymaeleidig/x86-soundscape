import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { announcements } from './announcements';

/**
 * The Announcements Window, rendering every entry in the list kept beside it.
 * The Menu's Pop-up reads that same list through its latest-entry component,
 * in its own shape.
 */
@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [NgFor],
  templateUrl: './announcements.component.html',
})
export class AnnouncementsComponent {
  readonly announcements = announcements;
}
