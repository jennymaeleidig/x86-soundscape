import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { type Observable, retry } from 'rxjs';
import { NgxMarqueeComponent } from '@omnedia/ngx-marquee';
import {
  ArchiveService,
  type Video,
} from '../../services/archive/archive.service';
import { CHANNELS, type Channel } from '../../services/archive/channels';

// Re-export the service's Video shape so the template binds unchanged.
export type VideoData = Video;

@Component({
  selector: 'app-surfer',
  imports: [CommonModule, NgxMarqueeComponent],
  templateUrl: './surfer.component.html',
  styleUrl: './surfer.component.css',
})
export class SurferComponent {
  // The Surfer holds the Channel itself — no index beside it — so the label
  // it prints is the Channel it is showing and cannot go stale.
  currentChannel: Channel = CHANNELS[0];

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
    const next = CHANNELS.indexOf(this.currentChannel) + 1;
    this.currentChannel = CHANNELS[next % CHANNELS.length];
    this.video$ = this.fetchVideo();
  }

  getTooltip(title: string, uploader: string): string {
    return `Now Playing: ${title} by ${uploader} on the ${this.currentChannel.name} channel.`;
  }

  private fetchVideo(): Observable<VideoData> {
    // Fetch a random video directly from archive.org via ArchiveService.
    // retry(5) handles transient network failures; degenerate-page retries
    // are absorbed inside the service (up to 3 page attempts).
    return this.archive.randomVideo(this.currentChannel).pipe(retry(5));
  }
}
