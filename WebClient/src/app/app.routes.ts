import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { RegisterComponent } from './components/account/register/register.component';
import { LoginComponent } from './components/account/login/login.component';
import { StoreOwnerDashboardComponent } from './components/store-owner-layout/store-owner-dashboard/store-owner-dashboard.component';
import { ShoppingCartComponent } from './components/customer-layout/shopping-cart/shopping-cart.component';
import { CheckoutComponent } from './components/customer-layout/checkout/checkout.component';

export const appRoutes: Routes = [
  { path: '', component: LandingPageComponent }, // Base URL -> Landing Page
  { path: 'landing', component: LandingPageComponent },
  { path: 'home', component: LandingPageComponent },
  { path: 'register', component: RegisterComponent},
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: StoreOwnerDashboardComponent },
  { path: 'cart', component: ShoppingCartComponent},
  { path: 'checkout', component: CheckoutComponent}
];

export const appRouterProvider = provideRouter(appRoutes);
