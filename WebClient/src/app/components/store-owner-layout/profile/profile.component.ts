import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { DeliveryService } from '../../../services/delivery.service';
import { PaymentService } from '../../../services/payment.service';
import { PurchaseService, OrderHistoryItemDTO } from '../../../services/purchase.service';
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

  // Tab navigation
  activeTab: string = 'account';
  tabs = [
    { id: 'account', name: 'Account Info' },
    { id: 'payments', name: 'Payment Methods' },
    { id: 'addresses', name: 'Delivery Addresses' },
    { id: 'history', name: 'Purchase History' }
  ];

  // Profile edit variables
  editMode: boolean = false;
  profileForm!: FormGroup;
  isSavingProfile: boolean = false;
  profileError: string | null = null;

  // Existing variables
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

  // Purchase history variables
  purchaseHistory: OrderHistoryItemDTO[] = [];
  isLoadingHistory: boolean = false;
  historyError: string | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private deliveryService: DeliveryService,
    private paymentService: PaymentService,
    private purchaseService: PurchaseService
  ) { }

  ngOnInit(): void {
    this.initializeForms();
    this.loadStripe();

    this.userService.activeUser$.subscribe(u => {
      this.user = u;
      this.initializeForms();
      
      // Only load addresses and payment methods if we have a valid user (not guest)
      if (this.user && this.user.Id > 0) {
        this.loadDeliveryAddresses(this.user.Id);
        this.loadPaymentMethods(this.user.Id);
      }
      console.log('User updated:', this.user);
    });
  }

  initializeForms(): void {
    // Initialize profile form
    this.profileForm = this.fb.group({
      FirstName: [this.user?.FirstName || '', Validators.required],
      LastName: [this.user?.LastName || '', Validators.required],
      Phone: [this.user?.Phone || '', Validators.required],
      Address: [this.user?.Address || '', Validators.required],
      Country: [this.user?.Country || '', Validators.required]
    });

    // Initialize delivery form (existing code)
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

  // Tab navigation methods
  setActiveTab(tabId: string): void {
    this.activeTab = tabId;

    // Reset edit mode when changing tabs
    if (this.editMode) {
      this.cancelEdit();
    }

    // Reset forms when changing tabs
    if (tabId === 'payments') {
      this.showAddPayment = false;
      this.unmountCardElement();
    } else if (tabId === 'addresses') {
      this.showAddDelivery = false;
    } else if (tabId === 'history') {
      // Load purchase history when the tab is selected
      this.loadPurchaseHistory(this.currentPage);
    }
  }

  isTabActive(tabId: string): boolean {
    return this.activeTab === tabId;
  }

  // Profile editing methods
  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.profileForm.setValue({
        FirstName: this.user?.FirstName || '',
        LastName: this.user?.LastName || '',
        Phone: this.user?.Phone || '',
        Address: this.user?.Address || '',
        Country: this.user?.Country || ''
      });
    } else {
      this.profileError = null;
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid && this.user) {
      this.isSavingProfile = true;
      this.profileError = null;

      // Create updated user object
      const updatedUser: User = {
        ...this.user,
        FirstName: this.profileForm.value.FirstName,
        LastName: this.profileForm.value.LastName,
        Phone: this.profileForm.value.Phone,
        Address: this.profileForm.value.Address,
        Country: this.profileForm.value.Country
      };

      this.userService.updateUserProfile(updatedUser).subscribe({
        next: (success) => {
          if (success) {
            this.user = updatedUser;
            this.editMode = false;
          } else {
            this.profileError = 'Failed to update profile. Please try again.';
          }
          this.isSavingProfile = false;
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          this.profileError = 'An error occurred while updating your profile. Please try again.';
          this.isSavingProfile = false;
        }
      });
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    this.profileError = null;
    // Reset form to original values
    this.profileForm.reset({
      FirstName: this.user?.FirstName || '',
      LastName: this.user?.LastName || '',
      Phone: this.user?.Phone || '',
      Address: this.user?.Address || '',
      Country: this.user?.Country || ''
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
    this.paymentService.getPaymentMethods().subscribe(methods => {
      this.paymentMethods = methods;
    });
  }

  loadPurchaseHistory(page: number): void {
    this.isLoadingHistory = true;
    this.historyError = null;

    this.purchaseService.getPurchaseHistory(page, this.itemsPerPage).subscribe({
      next: (response) => {
        this.purchaseHistory = response.purchases;
        this.totalPages = Math.ceil(response.total / this.itemsPerPage);
        this.isLoadingHistory = false;
      },
      error: (err) => {
        console.error('Error loading purchase history:', err);
        this.historyError = 'Failed to load purchase history. Please try again.';
        this.isLoadingHistory = false;
      }
    });
  }

  previousPage(): void {
    if (this.currentPage > 1 && !this.isLoadingHistory) {
      this.currentPage--;
      this.loadPurchaseHistory(this.currentPage);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages && !this.isLoadingHistory) {
      this.currentPage++;
      this.loadPurchaseHistory(this.currentPage);
    }
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
        this.paymentService.setDefaultPaymentMethod(paymentMethodId).subscribe(success => {
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
