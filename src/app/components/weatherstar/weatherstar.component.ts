import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

const WS4KP_BASE = 'https://weatherstar.netbymatt.com/';
const BASE_PARAMS =
  'hazards=true&current-weather=true&latest-observations=true' +
  '&hourly=true&hourly-graph=true&travel=false' +
  '&regional-forecast=true&local-forecast=true&extended-forecast=true' +
  '&almanac=true&spc-outlook=true&radar=true' +
  '&kiosk=true&stickyKiosk=false&customTextEnable=false' +
  '&speed=1.00&viewMode=standard&units=us' +
  '&wide=false&portrait=false&enhanced=false&scanLines=false' +
  '&customText=';

@Component({
  selector: 'app-weatherstar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './weatherstar.component.html',
  styleUrl: './weatherstar.component.css',
})
export class WeatherStarComponent {
  location = 'Richmond, VA, USA';
  weatherUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.weatherUrl = this.buildUrl(this.location);
  }

  updateLocation() {
    this.weatherUrl = this.buildUrl(this.location);
  }

  private buildUrl(location: string): SafeResourceUrl {
    const encoded = encodeURIComponent(location);
    const params = `${BASE_PARAMS}&latLonQuery=${encoded}&txtLocation=${encoded}`;
    const url = `${WS4KP_BASE}?${params}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
