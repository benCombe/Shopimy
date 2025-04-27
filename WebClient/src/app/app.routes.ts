import { Routes } from '@angular/router';
import { RegisterComponent } from './components/account/register/register.component';
import { LoginComponent } from './components/account/login/login.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { CreateStoreComponent } from './components/create-store/create-store.component';
//import { StoreOwnerLayoutComponent } from './components/store-owner-layout/store-owner-layout.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { StorePageComponent } from './components/customer-layout/store-page/store-page.component';
import { CategoryPageComponent } from './components/customer-layout/category-page/category-page.component';
import { ItemDetailComponent } from './components/item-detail/item-detail.component';
import { StoreRedirectComponent } from './components/store-redirect/store-redirect.component';
import { PublicLayoutComponent } from './components/layouts/public-layout/public-layout.component';
import { StoreOwnerGuard } from './guards/store-owner.guard';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { BlogComponent } from './components/blog/blog.component';
import { ContactComponent } from './components/contact/contact.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './components/terms-of-service/terms-of-service.component';
import { DocsComponent } from './components/docs/docs.component';
import { SupportComponent } from './components/support/support.component';
import { StoreOwnerDashboardComponent } from './components/store-owner-layout/store-owner-dashboard/store-owner-dashboard.component';
import { ShoppingCartComponent } from './components/customer-layout/shopping-cart/shopping-cart.component';
import { CheckoutComponent } from './components/customer-layout/checkout/checkout.component';

export const appRoutes: Routes = [
  // Public routes with PublicLayoutComponent
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: LandingPageComponent },
      { path: 'about', component: AboutUsComponent },
      { path: 'blog', component: BlogComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'privacy', component: PrivacyPolicyComponent },
      { path: 'terms', component: TermsOfServiceComponent },
      { path: 'docs', component: DocsComponent },
      { path: 'support', component: SupportComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'login', component: LoginComponent },
      { path: 'create-store', component: CreateStoreComponent },
      { path: '404', component: PageNotFoundComponent },
      { path: 'store', component: StoreRedirectComponent }, // Use the redirect component to go to user's store
    ]
  },
  
  // Redirects
  { path: 'landing', redirectTo: '', pathMatch: 'full' },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'profile', redirectTo: 'dashboard', pathMatch: 'full' },

  // Dashboard route - already has side-nav in its component
  { path: 'dashboard', component: StoreOwnerDashboardComponent, canActivate: [StoreOwnerGuard] },
  
  // Store routes - already has store-nav in its component
  {
    path: ':storeUrl',
    component: StorePageComponent,
    children: [
      { path: 'cart', component: ShoppingCartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'item/:id', component: ItemDetailComponent },
      { path: ':category', component: CategoryPageComponent },
    ]
  },
  
  // Fallback route
  { path: '**', redirectTo: '/404' }
];
