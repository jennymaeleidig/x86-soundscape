import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { type Observable, retry } from 'rxjs';
import { NgxMarqueeComponent } from '@omnedia/ngx-marquee';
import {
  ArchiveService,
  type Video,
} from '../../services/archive/archive.service';

// Re-export the service's Video shape so the template binds unchanged.
export type VideoData = Video;

@Component({
  selector: 'app-surfer',
  imports: [CommonModule, NgxMarqueeComponent],
  templateUrl: './surfer.component.html',
  styleUrl: './surfer.component.css',
})
export class SurferComponent {
  channels: Array<string> = [
    'Somewhat Commercial',
    'VHS Vault',
    'Anime All Access',
    'Gamer Nation',
    'Kids Korner',
  ];

  currentChannel: number = 0;

  // Define an Observable property for the video data
  video$: Observable<VideoData> | null;

  private readonly archive = inject(ArchiveService);

  constructor() {
    this.video$ = null;
  }

  ngOnInit() {
    this.video$ = this.fetchVideo();
  }

  changeChannel() {
    if (this.currentChannel === this.channels.length - 1) {
      this.currentChannel = 0;
    } else {
      this.currentChannel += 1;
    }
    this.video$ = this.fetchVideo();
  }

  getChannel() {
    return this.channels[this.currentChannel];
  }

  getTooltip(title: string, uploader: string): string {
    return `Now Playing: ${title} by ${uploader} on the ${this.getChannel()} channel.`;
  }

  private fetchVideo(): Observable<VideoData> {
    // Fetch a random video directly from archive.org via ArchiveService.
    // retry(5) handles transient network failures; degenerate-page retries
    // are absorbed inside the service (up to 3 page attempts).
    return this.archive.randomVideo(this.getChannel()).pipe(retry(5));
  }
}
