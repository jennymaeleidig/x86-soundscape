import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) => {
  // pi-lens-ignore: no-console-except-error — a bootstrap failure has nowhere else to go.
  console.error(err);
});
