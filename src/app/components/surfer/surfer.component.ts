import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable, retry } from 'rxjs';
import { X86_AGENT_ROOT } from './surfer.config';
import { NgxMarqueeComponent } from '@omnedia/ngx-marquee';

//Interface for the expected video data
interface VideoData {
  url: string;
  title: string;
  uploader: string;
  duration: number;
}

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

  constructor(
    private http: HttpClient,
    @Inject(X86_AGENT_ROOT) private x86AgentRoot: string,
  ) {
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
    // Return type uses VideoData
    const apiPath = `${this.x86AgentRoot}/video`;
    let requestBody = {
      query: `Please get me a video from the ${this.getChannel()} channel.`,
    };

    // Return the observable chain from the http post request
    return this.http.post<VideoData>(apiPath, requestBody).pipe(
      retry(5), // retry the request up to 5 times
    );
  }
}
