import type { WeatherSource } from './weather-source.types';

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

export const WS4KP: WeatherSource = {
  id: 'ws4kp',
  displayName: 'WeatherStar 4000+',
  baseUrl: WS4KP_BASE,
  allow: 'geolocation',
  acceptsLocationParam: true,
  buildUrl: (location: string): string => {
    const encoded = encodeURIComponent(location);
    const params = `${BASE_PARAMS}&latLonQuery=${encoded}&txtLocation=${encoded}`;
    return `${WS4KP_BASE}?${params}`;
  },
};

export const RETRO: WeatherSource = {
  id: 'retro',
  displayName: 'RetroCast',
  baseUrl: 'https://weather.com/retro/',
  allow: 'geolocation',
  acceptsLocationParam: false,
  buildUrl: (): string => 'https://weather.com/retro/',
};
