import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { RegisterComponent } from './components/account/register/register.component';
import { LoginComponent } from './components/account/login/login.component';
import { ProfileComponent } from './components/account/profile/profile.component';
import { StoreOwnerDashboardComponent } from './components/store-owner-layout/store-owner-dashboard/store-owner-dashboard.component';
import { ShoppingCartComponent } from './components/customer-layout/shopping-cart/shopping-cart.component';
import { CheckoutComponent } from './components/customer-layout/checkout/checkout.component';
import { ItemListComponent } from './components/item-list/item-list.component';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { CategoryFormComponent } from './components/category-form/category-form.component';
import { ItemDetailComponent } from './components/item-detail/item-detail.component'; // Ensure this path is correct
import { StorePageComponent } from './components/customer-layout/store-page/store-page.component';
import { CategoryPageComponent } from './components/customer-layout/category-page/category-page.component';
import { ItemPageComponent } from './components/customer-layout/item-page/item-page.component';
import { SuccessComponent } from './components/SuccessComponent';
import { CancelComponent } from './components/CancelComponent';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { OrdersComponent } from './components/store-owner-layout/orders/orders.component';

export const appRoutes: Routes = [
  { path: '', component: LandingPageComponent }, // Base URL -> Landing Page
  { path: 'landing', component: LandingPageComponent },
  { path: 'home', component: LandingPageComponent },
  { path: 'register', component: RegisterComponent},
  { path: 'login', component: LoginComponent },
  { path: 'profile', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: StoreOwnerDashboardComponent },
  { path: '404', component: PageNotFoundComponent },
  { path: 'dashboard/categories', component: CategoryListComponent },
  { path: 'dashboard/categories/new', component: CategoryFormComponent },
  { path: 'dashboard/categories/edit/:id', component: CategoryFormComponent },
  { path: 'dashboard/orders', component: OrdersComponent },
  { path: 'items', component: ItemListComponent },
  { path: 'items/:id', component: ItemDetailComponent },
  { path: 'categories', component: CategoryListComponent},
  { path: 'categories/new', component: CategoryFormComponent },
  { path: 'categories/:id/edit', component: CategoryFormComponent },
  { path: 'success', component: SuccessComponent },
  { path: 'cancel', component: CancelComponent },

  {
    path: ':storeUrl',
    component: StorePageComponent,
    children: [
      { path: 'cart', component: ShoppingCartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: ':category', component: CategoryPageComponent },
      { path: ':category/:itemId', component: ItemPageComponent }
    ]
  },
  { path: '**', redirectTo: '/' } // Handle unknown routes

];

export const appRouterProvider = provideRouter(appRoutes);
