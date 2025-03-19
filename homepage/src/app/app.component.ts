import { Component,ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WinampComponent } from './winamp/winamp.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WinampComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'homepage';
}
