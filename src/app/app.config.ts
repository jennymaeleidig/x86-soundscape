import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DragToSelectModule } from 'ngx-drag-to-select';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { environment } from './environments/environment';
import { X86_AGENT_ROOT } from './components/surfer/surfer.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(DragToSelectModule.forRoot()),
    provideHttpClient(),
    { provide: X86_AGENT_ROOT, useValue: environment.X86_AGENT_ROOT },
  ],
};
