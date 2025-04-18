import { ShoppingCartComponent } from './../shopping-cart/shopping-cart.component';
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
    private paymentService: PaymentService,
    private shopService: ShoppingService
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

  }

  proceedToPayment() {
    if (this.shippingForm.valid && this.storeDetails) {
      // TODO: Replace placeholders with actual order details from your cart/order service
      // Example: Inject a CartService and get items/total
      // const cartTotal = this.cartService.getTotal(); // Get total amount
      // const cartItemsDescription = this.cartService.getItemsDescription(); // Get a description (e.g., "Order #12345" or summary)

      const amount = 50.00; // Example amount - REPLACE with cartTotal
      const productName = `Order for ${this.storeDetails.name}`; // Example product name - REPLACE with cartItemsDescription or similar

      // Ensure amount is valid
      if (amount <= 0) {
        console.error('Invalid order amount.');
        alert('Cannot proceed to payment with an empty cart or invalid amount.');
        return;
      }

      this.paymentService.createCheckoutSession(amount, productName, this.storeDetails.id.toString())
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
      console.error('Shipping form is invalid or store details are missing.');
    }
  }

  placeOrder(){
    const email = this.shippingForm.get('email')?.value;
    const deliveryAddress = this.shippingForm.get("firstName")?.value
                   + " " + this.shippingForm.get('lastName')?.value
                   + ", " + this.shippingForm.get('address')?.value
                   + ", " + this.shippingForm.get('city')?.value
                   + ", " + this.shippingForm.get('province')?.value
                   + ", " + this.shippingForm.get('country')?.value
                   + ", " + this.shippingForm.get('postalCode')?.value;

    this.shopService.placeOrder(email, deliveryAddress).subscribe({
      next: (orderId) => {

        console.log("Order placed successfully, Order ID:", orderId);

      }
    });
  }

}
