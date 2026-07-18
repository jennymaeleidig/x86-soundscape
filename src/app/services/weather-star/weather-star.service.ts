import { Injectable, computed, inject, signal } from "@angular/core";
import { DomSanitizer, type SafeResourceUrl } from "@angular/platform-browser";
import { RETRO, WS4KP } from "./weather-sources";
import type { WeatherSource } from "./weather-source.types";

@Injectable({ providedIn: "root" })
export class WeatherStarService {
	private readonly sanitizer = inject(DomSanitizer);

	private readonly apps: WeatherSource[] = [WS4KP, RETRO];

	readonly activeAppId = signal("ws4kp");
	readonly location = signal("Richmond, VA, USA");

	readonly activeApp = computed(
		() => this.apps.find((a) => a.id === this.activeAppId()) ?? WS4KP,
	);

	readonly locationVisible = computed(
		() => this.activeApp().acceptsLocationParam,
	);

	readonly signedUrl = computed<SafeResourceUrl>(() =>
		this.sanitizer.bypassSecurityTrustResourceUrl(
			this.activeApp().buildUrl(this.location()),
		),
	);

	// The non-active app — drives the single toggle button's label/destination.
	readonly otherApp = computed(
		() => this.apps.find((a) => a.id !== this.activeAppId()) ?? RETRO,
	);

	toggle(): void {
		this.activeAppId.set(this.otherApp().id);
	}

	setActiveApp(id: string): void {
		this.activeAppId.set(id);
	}

	updateLocation(loc: string): void {
		if (!this.activeApp().acceptsLocationParam) return;
		this.location.set(loc);
	}
}
