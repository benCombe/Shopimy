import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../services/store.service';
import { PaymentService } from '../../services/payment.service';
import { StoreDetails } from '../../models/store-details';

@Component({
  selector: 'app-checkout',
  template: `<button (click)="checkout()">Pay Now</button>`,
  standalone: true
})
export class CheckoutComponent implements OnInit {
  activeStore!: StoreDetails;

  constructor(private storeService: StoreService, private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.storeService.activeStore$.subscribe(store => {
      this.activeStore = store;
    });
  }

  checkout(): void {
    // Pass the active store id along with order details
    this.paymentService.createCheckoutSession(49.99, 'Sample Product', this.activeStore.id.toString())
      .subscribe(response => {
        window.location.href = response.sessionUrl;
      });
  }
}
