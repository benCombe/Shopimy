import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appRouterProvider } from './app/app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {VERSION as MAT_VERSION, MatNativeDateModule} from '@angular/material/core';
import {UserPageComponent} from './app/components/account/user-page/user-page.component';


console.info('Angular Material version', MAT_VERSION.full);

bootstrapApplication(AppComponent, {
  providers: [appRouterProvider, provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync()]
}).catch(err => console.error(err));
