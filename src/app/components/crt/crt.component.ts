import { Component } from '@angular/core';

// Attribute-selector component that wraps content (<ng-content>) and applies
// the shared CRT effect (grayscale + scanlines).
// Usage: <div appCrt><iframe ...></div>
// Single source of truth for the CRT overlay; the Weather and Surfer panes
// both wrap their content in it.
@Component({
  selector: '[appCrt]',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './crt.component.css',
})
export class CrtComponent {}
