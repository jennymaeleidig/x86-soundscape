import { Component } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { WinampComponent } from "../winamp/winamp.component";

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [MenuComponent, WinampComponent],
  templateUrl: './desktop.component.html',
  styleUrl: './desktop.component.css'
})
export class DesktopComponent {

}
