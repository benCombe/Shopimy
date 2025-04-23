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
  paymentForm: FormGroup;
  storeUrl: string = '';
  storeId: number = 0;
  checkoutItems: CheckoutItem[] = [];
  isLoading: boolean = false;
  storeDetails: StoreDetails | null = null;
  
  private formBuilder = inject(FormBuilder);
  
  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService,
    private shoppingService: ShoppingService,
    private paymentService: PaymentService
  ) {
    this.shippingForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });

    this.paymentForm = this.formBuilder.group({
      cardNumber: ['', Validators.required],
      expiration: ['', Validators.required],
      cvv: ['', Validators.required]
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
      // Show loading state
      this.isLoading = true;

      // --- Consolidate checks --- //
      if (!this.storeUrl || this.storeId === 0) {
        console.error('Store URL or ID is missing.');
        alert('Cannot proceed to payment: Store information is missing.');
        this.isLoading = false;
        return;
      }

      if (!this.storeDetails || !this.storeDetails.name) {
        console.error('Store details are missing or invalid.');
        alert('Cannot proceed to payment: Store details are invalid.');
        this.isLoading = false;
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
        this.isLoading = false;
        return;
      }

      if (this.shippingForm.valid) {
        this.paymentService.createCheckoutSession(this.checkoutItems, this.storeUrl, this.storeId)
          .subscribe({
            next: (response) => {
              this.isLoading = false;
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
        this.isLoading = false;
      }
    }
  }

  placeOrder() {
    if (this.shippingForm.valid) {
      this.isLoading = true;
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
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error("Error placing order (Placeholder):", err);
          alert("Failed to place order. Please contact support.");
          this.isLoading = false;
        }
      });
    } else {
      this.shippingForm.markAllAsTouched();
    }
  }
}
