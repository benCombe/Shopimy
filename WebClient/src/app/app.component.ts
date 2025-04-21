import { Component } from '@angular/core';
import { PopupComponent } from './components/utilities/popup/popup.component'; // Import PopupComponent
import { LandingPageComponent } from "./components/landing-page/landing-page.component";
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { StoreOwnerDashboardComponent } from "./components/store-owner-layout/store-owner-dashboard/store-owner-dashboard.component";
import { ShoppingCartComponent } from "./components/customer-layout/shopping-cart/shopping-cart.component";
import { CheckoutComponent } from "./components/customer-layout/checkout/checkout.component";
import { LoadingOneComponent } from "./components/utilities/loading-one/loading-one.component";

@Component({
  selector: 'app-root',
  standalone: true,  // ✅ Standalone component
  imports: [RouterOutlet, LoadingOneComponent], // ✅ Import only used components
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showPopup = false;
  question = 'Do you want to continue?';
  responses = ['Yes', 'No', 'Maybe'];

  handleResponse(response: string) {
    console.log('User selected:', response);
    this.showPopup = false; // Hide popup after selection
  }

  openPopup() {
    this.showPopup = true;
  }
}
