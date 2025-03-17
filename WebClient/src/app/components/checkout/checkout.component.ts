// In your payment/checkout component (e.g., checkout.component.ts)
import { Component } from '@angular/core';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-checkout',
  template: `<button (click)="checkout()">Pay Now</button>`
})
export class CheckoutComponent {
  constructor(private paymentService: PaymentService) {}

  checkout(): void {
    // Example amount and product name; adjust accordingly
    this.paymentService.createCheckoutSession(49.99, 'Sample Product').subscribe(response => {
      window.location.href = response.sessionUrl;
    });
  }
}
