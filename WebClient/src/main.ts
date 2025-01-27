import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appRouterProvider } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [appRouterProvider]
}).catch(err => console.error(err));
