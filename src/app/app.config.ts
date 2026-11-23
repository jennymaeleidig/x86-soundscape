import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { DragToSelectModule } from 'ngx-drag-to-select';

import { provideHttpClient, withXhr } from '@angular/common/http';
import { NowPlayingTransport } from './services/now-playing/transport';
import { HttpNowPlayingTransport } from './services/now-playing/transport';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(DragToSelectModule.forRoot()),
    provideHttpClient(withXhr()),
    {
      provide: NowPlayingTransport,
      useExisting: HttpNowPlayingTransport,
    },
  ],
};
