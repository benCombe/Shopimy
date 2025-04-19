import { ShoppingCartComponent } from './../shopping-cart/shopping-cart.component';
import { AfterViewInit, Component, Input, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import { ThemeService } from '../../../services/theme.service';
import { OrderSummaryComponent } from "../order-summary/order-summary.component";
import { PaymentService } from '../../../services/payment.service';
import { ShoppingService } from '../../../services/shopping.service';
import { CheckoutItem } from '../../../models/checkout-item.model';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../../../services/store.service';
import { switchMap, take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { StoreDetails } from '../../../models/store-details';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, OrderSummaryComponent, CommonModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})

export class CheckoutComponent implements OnInit {

  shippingForm: FormGroup;
  storeUrl: string = '';
  storeId: number = 0;
  storeDetails: StoreDetails | null = null;
  checkoutItems: CheckoutItem[] = [];
  isLoading: boolean = false;

  private fb = inject(FormBuilder);
  private themeService = inject(ThemeService);
  private paymentService = inject(PaymentService);
  private shoppingService = inject(ShoppingService);
  private route = inject(ActivatedRoute);
  private storeService = inject(StoreService);

  constructor() {
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

  ngOnInit(): void {
    this.loadCheckoutData();
  }

  loadCheckoutData(): void {
    this.isLoading = true;
    this.route.paramMap.pipe(
      take(1),
      switchMap(params => {
        const url = params.get('storeUrl');
        if (!url) {
          console.error('Store URL not found in route parameters.');
          throw new Error('Store URL missing');
        }
        this.storeUrl = url;
        return this.storeService.getStoreDetails(this.storeUrl);
      })
    ).subscribe({
      next: (storeDetails) => {
        if (!storeDetails) {
          console.error('Store details could not be loaded for URL:', this.storeUrl);
          throw new Error('Store details missing');
        }
        this.storeDetails = storeDetails;
        this.storeId = storeDetails.id;
        this.checkoutItems = this.shoppingService.CartSubject.getValue().map(cartItem => ({
          id: cartItem.item.listId,
          name: cartItem.item.name,
          price: Math.min(cartItem.item.price, cartItem.item.salePrice),
          quantity: cartItem.quantity
        }));
        if (this.checkoutItems.length === 0) {
           console.warn('Checkout initiated with an empty cart.');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading checkout data:', err);
        alert('Failed to load checkout information. Please try again.');
        this.isLoading = false;
      }
    });
  }

  proceedToPayment(): void {
    if (this.shippingForm.valid && this.storeDetails) {
      // TODO: Replace placeholders with actual order details from your cart/order service
      // Example: Inject a CartService and get items/total
      // const cartTotal = this.cartService.getTotal(); // Get total amount
      // const cartItemsDescription = this.cartService.getItemsDescription(); // Get a description (e.g., "Order #12345" or summary)

      // const amount = 50.00; // Example amount - REPLACE with cartTotal
      // const productName = `Order for ${this.storeDetails.name}`; // Example product name - REPLACE with cartItemsDescription or similar

      // --- Consolidate checks --- //
      if (!this.storeUrl || this.storeId === 0) {
        console.error('Store URL or ID is missing.');
        alert('Cannot proceed to payment: Store information is missing.');
        return;
      }

      if (!this.storeDetails || !this.storeDetails.name) {
        console.error('Store details are missing or invalid.');
        alert('Cannot proceed to payment: Store details are invalid.');
        return;
      }

      // Get grouped items inside the payment method if needed, or ensure it's up-to-date
      this.checkoutItems = this.shoppingService.CartSubject.getValue().map(cartItem => ({
        id: cartItem.item.listId,
        name: cartItem.item.name,
        price: Math.min(cartItem.item.price, cartItem.item.salePrice),
        quantity: cartItem.quantity
      }));

      if (!this.checkoutItems || this.checkoutItems.length === 0) {
        console.error('Cart is empty.');
        alert('Cannot proceed to payment with an empty cart.');
        return;
      }

      if (this.shippingForm.valid) {
        this.isLoading = true;
        this.paymentService.createCheckoutSession(this.checkoutItems, this.storeUrl, this.storeId)
          .subscribe({
            next: (response) => {
              window.location.href = response.sessionUrl;
            },
            error: (error) => {
              console.error('Error creating Stripe checkout session:', error);
              alert('Could not proceed to payment. Please try again later.');
              this.isLoading = false;
            }
          });
      } else {
        this.shippingForm.markAllAsTouched();
        console.error('Shipping form is invalid.');
        alert('Please fill in all required shipping information.');
      }
    }
  }

  placeOrder() {
    const email = this.shippingForm.get('email')?.value;
    const deliveryAddress = this.shippingForm.get("firstName")?.value
                   + " " + this.shippingForm.get('lastName')?.value
                   + ", " + this.shippingForm.get('address')?.value
                   + ", " + this.shippingForm.get('city')?.value
                   + ", " + this.shippingForm.get('province')?.value
                   + ", " + this.shippingForm.get('country')?.value
                   + ", " + this.shippingForm.get('postalCode')?.value;

    this.shoppingService.placeOrder(email, deliveryAddress).subscribe({
      next: (orderId: any) => {
        console.log("Order placed successfully (Placeholder - verify flow), Order ID:", orderId);
        // TODO: Likely need to clear cart, navigate to confirmation page, etc.
      },
      error: (err: any) => {
        console.error("Error placing order (Placeholder):", err);
        alert("Failed to place order. Please contact support.");
      }
    });
  }

}
