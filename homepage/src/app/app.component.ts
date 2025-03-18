import { Component,ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Webamp from 'webamp';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  @ViewChild('app') app!: ElementRef<HTMLElement>
  title = 'homepage';

  ngAfterViewInit() {
    let webamp: Webamp = new Webamp({}); 
    // Here we go! Let's show Webamp.
    webamp.renderWhenReady(this.app.nativeElement)
  }

  ngOnInit() {
    if (!Webamp.browserIsSupported()) {
      alert("Oh no! Webamp does not work in this browser!");
      throw new Error("What's the point of anything?");
    }
  }
}
