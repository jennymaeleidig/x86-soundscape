export interface WeatherSource {
	id: string;
	displayName: string;
	baseUrl: string;
	allow: string;
	acceptsLocationParam: boolean;
	buildUrl: (location: string) => string;
}
