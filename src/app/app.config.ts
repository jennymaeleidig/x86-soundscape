import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { DragToSelectModule } from 'ngx-drag-to-select';

import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(DragToSelectModule.forRoot()),
    provideHttpClient(),
  ],
};
