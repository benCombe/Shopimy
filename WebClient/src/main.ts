import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    importProvidersFrom(HttpClientModule) // ✅ Provide HttpClientModule here!
  ]
}).catch(err => console.error(err));
