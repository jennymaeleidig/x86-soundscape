import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { DragToSelectModule } from 'ngx-drag-to-select';

import { provideHttpClient } from '@angular/common/http';
import { NowPlayingTransport } from './services/now-playing/transport';
import { HttpNowPlayingTransport } from './services/now-playing/transport';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(DragToSelectModule.forRoot()),
    provideHttpClient(),
    {
      provide: NowPlayingTransport,
      useExisting: HttpNowPlayingTransport,
    },
  ],
};
