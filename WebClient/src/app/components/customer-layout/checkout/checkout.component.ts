import { AfterViewInit, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import { ThemeService } from '../../../services/theme.service';
import { StoreDetails } from '../../../models/store-details';
import { OrderSummaryComponent } from "../order-summary/order-summary.component";
import { PaymentService } from '../../../services/payment.service';
import { ShoppingService } from '../../../services/shopping.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, OrderSummaryComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})

export class CheckoutComponent implements AfterViewInit{

  @Input() storeDetails: StoreDetails | null = null;

  shippingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    private paymentService: PaymentService,
    private shoppingService: ShoppingService
  ) {
    this.shippingForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]], // Allow 10-15 digit phone numbers
    });
  }

  ngAfterViewInit(): void {
    /* this.themeService.setThemeOne("theme1");
    this.themeService.setThemeTwo("theme2");
    this.themeService.setThemeThree("theme3");
    this.themeService.setFontColor("fc");
    this.themeService.setButtonHoverColor("hover"); */
  }

  proceedToPayment() {
    if (!this.storeDetails || !this.storeDetails.name) {
      console.error('Store details are missing or invalid.');
      alert('Cannot proceed to payment: Store information is missing.');
      return;
    }

    // Get the current subtotal from ShoppingService
    let subtotal = 0;
    this.shoppingService.SubTotal$.subscribe(value => {
      subtotal = value;
    }).unsubscribe();

    // Check if cart is empty or subtotal is invalid
    if (subtotal <= 0) {
      console.error('Cart is empty or subtotal is invalid:', subtotal);
      alert('Cannot proceed to payment with an empty cart.');
      return;
    }

    if (this.shippingForm.valid) {
      const productName = `Order from ${this.storeDetails.name}`;

      this.paymentService.createCheckoutSession(subtotal, productName, this.storeDetails.id.toString())
        .subscribe({
          next: (response) => {
            window.location.href = response.sessionUrl;
          },
          error: (error) => {
            console.error('Error creating Stripe checkout session:', error);
            alert('Could not proceed to payment. Please try again later.');
          }
        });
    } else {
      this.shippingForm.markAllAsTouched();
      console.error('Shipping form is invalid.');
    }
  }
}
