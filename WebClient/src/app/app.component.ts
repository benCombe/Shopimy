import { Component, OnInit, Injector } from '@angular/core';
import { PopupComponent } from './components/utilities/popup/popup.component'; // Import PopupComponent
import { LandingPageComponent } from "./components/landing-page/landing-page.component";
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { StoreOwnerDashboardComponent } from "./components/store-owner-layout/store-owner-dashboard/store-owner-dashboard.component";
import { ShoppingCartComponent } from "./components/customer-layout/shopping-cart/shopping-cart.component";
import { CheckoutComponent } from "./components/customer-layout/checkout/checkout.component";
import { LoadingOneComponent } from "./components/utilities/loading-one/loading-one.component";
import { UserService } from './services/user.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,  // ✅ Standalone component
  imports: [RouterOutlet, LoadingOneComponent], // ✅ Import only used components
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showPopup = false;
  question = 'Do you want to continue?';
  responses = ['Yes', 'No', 'Maybe'];

  constructor(
    private userService: UserService,
    private themeService: ThemeService,
    private injector: Injector
  ) {
    // Create a global injector instance to make services accessible
    (window as any)['appInjector'] = this.injector;
  }

  ngOnInit(): void {
    // Initialize user state on application startup
    // This ensures user authentication state persists through page reloads
    this.userService.initializeUserState();
    
    // Apply base theme initially
    this.themeService.applyBaseTheme();
  }

  handleResponse(response: string) {
    console.log('User selected:', response);
    this.showPopup = false; // Hide popup after selection
  }

  openPopup() {
    this.showPopup = true;
  }
}
