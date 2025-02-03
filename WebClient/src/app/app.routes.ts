import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { RegisterComponent } from './components/account/register/register.component';
import { LoginComponent } from './components/account/login/login.component';
import { UserPageComponent } from './components/account/user-page/user-page.component';

export const appRoutes: Routes = [
  { path: '', component: LandingPageComponent },  // Base URL -> Landing Page
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent }, // /register -> Register Page
  { path: 'user-page', component: UserPageComponent } // /userpage -> User Page
];

export const appRouterProvider = provideRouter(appRoutes);
