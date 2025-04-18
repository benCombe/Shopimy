import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { DeliveryService } from '../../../services/delivery.service';
import { PaymentService } from '../../../services/payment.service';
import { DeliveryDetails } from '../../../models/delivery-details';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  @Input() user: User | null | undefined;

  deliveryAddresses: DeliveryDetails[] = [];
  paymentMethods: any[] = [];
  wishlists: any[] = [];
  deliveryForm!: FormGroup;
  showAddDelivery: boolean = false;
  showAddPayment: boolean = false;
  stripe: Stripe | null = null;
  cardElement: StripeCardElement | null = null;
  @ViewChild('cardElement') cardElementRef!: ElementRef;
  cardError: string | null = null;
  isSavingPaymentMethod = false;
  newPaymentIsDefault = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private deliveryService: DeliveryService,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    this.initializeForms();
    if (this.user && this.user.Id > 0) {
      this.loadDeliveryAddresses(this.user.Id);
      this.loadPaymentMethods(this.user.Id);
    }
    this.loadStripe();

    this.userService.activeUser$.subscribe(u => {
      if (u && (!this.user || u.Id !== this.user.Id)) {
        this.user = u;
        this.initializeForms();
        this.loadDeliveryAddresses(this.user.Id);
        this.loadPaymentMethods(this.user.Id);
      }
    });
  }

  initializeForms(): void {
    this.deliveryForm = this.fb.group({
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: ['', Validators.required],
      phone: ['', Validators.required],
      isDefault: [false]
    });
  }

  loadStripe(): void {
    this.paymentService.getStripePublicKey().subscribe(data => {
      if (data.publicKey) {
        loadStripe(data.publicKey).then(stripeInstance => {
          this.stripe = stripeInstance;
          if (this.showAddPayment) {
            this.mountCardElement();
          }
        });
      } else {
        console.error('Stripe public key not received.');
      }
    }, error => {
      console.error('Error fetching Stripe public key:', error);
    });
  }

  loadDeliveryAddresses(userId: number): void {
    this.deliveryService.getDeliveryAddresses(userId).subscribe(addresses => {
      this.deliveryAddresses = addresses;
    });
  }

  loadPaymentMethods(userId: number): void {
    this.paymentService.getPaymentMethods(userId).subscribe(methods => {
      this.paymentMethods = methods;
    });
  }

  saveDeliveryAddress(): void {
    if (this.deliveryForm.valid && this.user && this.user.Id > 0) {
      const newAddress = new DeliveryDetails(
        this.user.Id,
        this.deliveryForm.value.address,
        this.deliveryForm.value.city,
        this.deliveryForm.value.state,
        this.deliveryForm.value.country,
        this.deliveryForm.value.postalCode,
        this.deliveryForm.value.phone,
        this.deliveryForm.value.isDefault
      );

      this.deliveryService.saveDeliveryAddress(newAddress).subscribe(success => {
        if (success) {
          this.loadDeliveryAddresses(this.user!.Id);
          this.showAddDelivery = false;
          this.deliveryForm.reset();
        }
      });
    }
  }

  savePaymentMethod(): void {
    if (!this.stripe || !this.cardElement || this.isSavingPaymentMethod) {
      console.warn('Stripe not loaded, card element not ready, or save already in progress.');
      return;
    }

    this.isSavingPaymentMethod = true;
    this.cardError = null;

    this.paymentService.createSetupIntent().subscribe({
      next: (intent) => {
        if (!intent || !intent.clientSecret) {
          this.cardError = 'Could not initialize payment setup. Please try again.';
          this.isSavingPaymentMethod = false;
          return;
        }

        this.stripe!.confirmCardSetup(intent.clientSecret, {
          payment_method: {
            card: this.cardElement!,
          }
        }).then(result => {
          if (result.error) {
            this.cardError = result.error.message || 'An unknown error occurred.';
            this.isSavingPaymentMethod = false;
          } else if (result.setupIntent?.status === 'succeeded') {
            const paymentMethodId = result.setupIntent.payment_method as string;
            this.paymentService.savePaymentMethod(paymentMethodId, this.newPaymentIsDefault)
              .subscribe({
                next: () => {
                  console.log('Payment method saved successfully');
                  this.loadPaymentMethods(this.user!.Id);
                  this.toggleAddPayment();
                  this.isSavingPaymentMethod = false;
                  this.newPaymentIsDefault = false;
                  this.unmountCardElement();
                },
                error: (err) => {
                  console.error('Error saving payment method to backend:', err);
                  this.cardError = 'Could not save payment method. Please try again.';
                  this.isSavingPaymentMethod = false;
                }
              });
          } else {
            this.cardError = 'Payment setup failed. Status: ' + result.setupIntent?.status;
            this.isSavingPaymentMethod = false;
          }
        });
      },
      error: (err) => {
        console.error('Error creating SetupIntent:', err);
        this.cardError = 'Could not initialize payment setup. Please try again.';
        this.isSavingPaymentMethod = false;
      }
    });
  }

  deleteAddress(addressId: number): void {
    if (confirm('Are you sure you want to delete this address?') && this.user && this.user.Id > 0) {
      this.deliveryService.deleteDeliveryAddress(addressId).subscribe(success => {
        if (success) {
          this.loadDeliveryAddresses(this.user!.Id);
        }
      });
    }
  }

  deletePaymentMethod(paymentMethodId: string): void {
    if (confirm('Are you sure you want to delete this payment method?') && this.user && this.user.Id > 0) {
      this.paymentService.deletePaymentMethod(paymentMethodId).subscribe(success => {
        if (success) {
          this.loadPaymentMethods(this.user!.Id);
        }
      });
    }
  }

  setDefaultAddress(addressId: number): void {
    if (this.user && this.user.Id > 0) {
        this.deliveryService.setDefaultDeliveryAddress(this.user.Id, addressId).subscribe(success => {
        if (success) {
            this.loadDeliveryAddresses(this.user!.Id);
        }
        });
    }
  }

  setDefaultPaymentMethod(paymentMethodId: string): void {
    if (this.user && this.user.Id > 0) {
        this.paymentService.setDefaultPaymentMethod(this.user.Id, paymentMethodId).subscribe(success => {
        if (success) {
            this.loadPaymentMethods(this.user!.Id);
        }
        });
    }
  }

  toggleAddDelivery(): void {
    this.showAddDelivery = !this.showAddDelivery;
  }

  toggleAddPayment(): void {
    this.showAddPayment = !this.showAddPayment;
    if (this.showAddPayment) {
      setTimeout(() => this.mountCardElement(), 0);
    } else {
      this.unmountCardElement();
    }
  }

  mountCardElement(): void {
    if (!this.stripe || this.cardElement) return;

    const elements = this.stripe.elements();
    this.cardElement = elements.create('card');
    this.cardElement.mount(this.cardElementRef.nativeElement);

    this.cardElement.on('change', (event) => {
      this.cardError = event.error ? event.error.message : null;
    });
  }

  unmountCardElement(): void {
    if (this.cardElement) {
      this.cardElement.unmount();
      this.cardElement.destroy();
      this.cardElement = null;
      this.cardError = null;
    }
  }
}
