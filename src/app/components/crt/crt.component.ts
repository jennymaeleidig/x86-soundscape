import { Component } from "@angular/core";

// Attribute-selector component that wraps content (<ng-content>) and applies
// the shared CRT effect (grayscale + scanlines + text-shadow animation).
// Usage: <div appCrt><iframe ...></div>
// Single source of truth for the CRT overlay; weather window uses this for
// both WeatherStar 4000+ and RetroCast. Surfer keeps its own .crt/.grayscale
// for now (follow-up change).
@Component({
	selector: "[appCrt]",
	standalone: true,
	template: "<ng-content></ng-content>",
	styleUrl: "./crt.component.css",
})
export class CrtComponent {}
