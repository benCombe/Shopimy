import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { DeliveryService } from '../../../services/delivery.service';
import { PaymentService } from '../../../services/payment.service';
import { User } from '../../../models/user';
import { DeliveryDetails } from '../../../models/delivery-details';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user!: User;
  deliveryAddresses: DeliveryDetails[] = [];
  paymentMethods: any[] = [];
  
  profileForm!: FormGroup;
  deliveryForm!: FormGroup;
  
  activeTab: string = 'profile';
  showAddDelivery: boolean = false;
  showAddPayment: boolean = false;
  
  stripe: Stripe | null = null;
  cardElement: StripeCardElement | null = null;
  @ViewChild('cardElement') cardElementRef!: ElementRef;
  cardError: string | null = null;
  isSavingPaymentMethod = false;
  newPaymentIsDefault = false;
  
  constructor(
    private userService: UserService,
    private deliveryService: DeliveryService,
    private paymentService: PaymentService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserData();
    this.loadStripe();
  }

  initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });

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

  loadUserData(): void {
    this.userService.activeUser$.subscribe(user => {
      this.user = user;
      this.profileForm.patchValue({
        firstName: user.FirstName,
        lastName: user.LastName,
        email: user.Email,
        phone: user.Phone
      });

      if (user.Id > 0) {
        this.loadDeliveryAddresses(user.Id);
        this.loadPaymentMethods(user.Id);
      }
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

  saveProfile(): void {
    if (this.profileForm.valid) {
      const updatedUser: User = {
        ...this.user,
        FirstName: this.profileForm.value.firstName,
        LastName: this.profileForm.value.lastName,
        Email: this.profileForm.value.email,
        Phone: this.profileForm.value.phone
      };
      
      this.userService.updateUserProfile(updatedUser).subscribe(success => {
        if (success) {
          console.log('Profile updated successfully');
        }
      });
    }
  }

  saveDeliveryAddress(): void {
    if (this.deliveryForm.valid && this.user.Id > 0) {
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
          this.loadDeliveryAddresses(this.user.Id);
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
                  this.loadPaymentMethods(this.user.Id);
                  this.toggleAddPayment();
                  this.isSavingPaymentMethod = false;
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
    if (confirm('Are you sure you want to delete this address?')) {
      this.deliveryService.deleteDeliveryAddress(addressId).subscribe(success => {
        if (success) {
          this.loadDeliveryAddresses(this.user.Id);
        }
      });
    }
  }

  deletePaymentMethod(paymentId: any): void {
    if (confirm('Are you sure you want to delete this payment method?')) {
      this.paymentService.deletePaymentMethod(paymentId).subscribe(success => {
        if (success) {
          this.loadPaymentMethods(this.user.Id);
        }
      });
    }
  }

  setDefaultAddress(addressId: number): void {
    this.deliveryService.setDefaultDeliveryAddress(this.user.Id, addressId).subscribe(success => {
      if (success) {
        this.loadDeliveryAddresses(this.user.Id);
      }
    });
  }

  setDefaultPaymentMethod(paymentMethodId: string): void {
    this.paymentService.setDefaultPaymentMethod(this.user.Id, paymentMethodId).subscribe(success => {
      if (success) {
        this.loadPaymentMethods(this.user.Id);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleAddDelivery(): void {
    this.showAddDelivery = !this.showAddDelivery;
    if (this.showAddDelivery) {
      this.deliveryForm.reset();
    }
  }

  toggleAddPayment(): void {
    this.showAddPayment = !this.showAddPayment;
    if (this.showAddPayment) {
      this.cardError = null;
      this.newPaymentIsDefault = false;
      this.mountCardElement();
    } else {
      this.unmountCardElement();
    }
  }

  mountCardElement(): void {
    if (this.stripe && this.cardElementRef && !this.cardElement) {
      const elements = this.stripe.elements();
      this.cardElement = elements.create('card', { /* style */ });
      this.cardElement.mount(this.cardElementRef.nativeElement);

      this.cardElement.on('change', (event) => {
        this.cardError = event.error ? event.error.message : null;
      });
    } else if (this.stripe && this.cardElementRef && this.cardElement) {
       this.cardElement.focus();
    }
  }

  unmountCardElement(): void {
    if (this.cardElement) {
      this.cardElement.unmount();
      this.cardElement.destroy();
      this.cardElement = null;
    }
  }
} 