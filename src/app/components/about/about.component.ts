import { Component } from '@angular/core';

/**
 * About's text, owned here rather than in a data file. The Window renders this
 * component into its pane; the Menu's Pop-up reads the same field, in its own
 * shape.
 */
@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
})
export class AboutComponent {
  static readonly text = `
      Welcome to the webpage for the x86 Soundscape internet radio livestream hub. Huge shoutout to the team over at the Webamp project and sakun for the system.css library. Webpage built with the TypeScript framework Angular.
    `;

  readonly text = AboutComponent.text;
}
