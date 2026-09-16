import { Component } from '@angular/core';
import { DesktopComponent } from './components/desktop/desktop.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DesktopComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'homepage';
}
