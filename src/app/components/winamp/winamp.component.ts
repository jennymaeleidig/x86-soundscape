import { Component, ElementRef, ViewChild } from '@angular/core';
import Webamp from 'webamp';
import { WinampService } from '../../services/winamp/winamp.service';

@Component({
  selector: 'winamp',
  standalone: true,
  imports: [],
  templateUrl: './winamp.component.html',
  styleUrl: './winamp.component.css',
})
export class WinampComponent {
  @ViewChild('winamp') winamp!: ElementRef<HTMLElement>;
  title = 'component';

  constructor(private webAmpService: WinampService) {}

  ngAfterViewInit() {
    this.webAmpService.setWinampRootElement(this.winamp.nativeElement);
    this.webAmpService.renderWinamp();
  }

  ngOnInit() {
    if (!Webamp.browserIsSupported()) {
      alert('Oh no! Webamp does not work in this browser!');
      throw new Error("What's the point of anything?");
    }
  }
}
