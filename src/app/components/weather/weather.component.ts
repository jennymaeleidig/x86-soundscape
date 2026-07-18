import { Component, effect, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { WeatherStarService } from "../../services/weather-star/weather-star.service";
import { CrtComponent } from "../crt/crt.component";

@Component({
	selector: "app-weather",
	standalone: true,
	imports: [FormsModule, CrtComponent],
	templateUrl: "./weather.component.html",
	styleUrl: "./weather.component.css",
})
export class WeatherComponent {
	protected readonly svc = inject(WeatherStarService);

	// Hidden while the iframe navigates to a new src so the old layout (e.g.
	// WS4KP's letterbox) doesn't flash before the overscan crop can mask it.
	loading = signal(true);

	// Raw two-way-bound input value; only committed to the service on Update so
	// the iframe doesn't refresh on every keystroke.
	rawLocation = this.svc.location();

	constructor() {
		// Any src change (toggle or location commit) starts a new load.
		effect(() => {
			this.svc.signedUrl();
			this.loading.set(true);
		});
	}

	commitLocation() {
		this.svc.updateLocation(this.rawLocation);
	}

	onIframeLoad() {
		this.loading.set(false);
	}
}
