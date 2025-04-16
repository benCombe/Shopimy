import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { DeliveryService } from '../../../services/delivery.service';
import { PaymentService } from '../../../services/payment.service';
import { User } from '../../../models/user';
import { DeliveryDetails } from '../../../models/delivery-details';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { PurchaseService, PurchaseHistoryResponse } from '../../../services/purchase.service';
import { WishListService, WishList } from '../../../services/wishlist.service';

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
  purchaseHistory: any[] = [];
  wishLists: any[] = [];
  
  profileForm!: FormGroup;
  deliveryForm!: FormGroup;
  
  activeTab: string = 'profile';
  showAddDelivery: boolean = false;
  showAddPayment: boolean = false;
  editMode: boolean = false;
  
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 10;
  
  // Loading states
  isSavingProfile: boolean = false;
  isSavingDelivery: boolean = false;
  isSavingPaymentMethod: boolean = false;
  
  stripe: Stripe | null = null;
  cardElement: StripeCardElement | null = null;
  @ViewChild('cardElement') cardElementRef!: ElementRef;
  cardError: string | null = null;
  newPaymentIsDefault = false;
  
  constructor(
    private userService: UserService,
    private deliveryService: DeliveryService,
    private paymentService: PaymentService,
    private purchaseService: PurchaseService,
    private wishListService: WishListService,
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
      phone: ['', Validators.required],
      country: ['']
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
        phone: user.Phone,
        country: user.Country || 'Canada' // Default value
      });

      if (user.Id > 0) {
        this.loadDeliveryAddresses(user.Id);
        this.loadPaymentMethods(user.Id);
        this.loadPurchaseHistory(user.Id, this.currentPage);
        this.loadWishLists(user.Id);
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
  
  loadPurchaseHistory(userId: number, page: number): void {
    this.purchaseService.getPurchaseHistory(userId, page, this.itemsPerPage).subscribe(
      (result: PurchaseHistoryResponse) => {
        this.purchaseHistory = result.purchases;
        this.totalPages = Math.ceil(result.total / this.itemsPerPage);
      }
    );
  }
  
  loadWishLists(userId: number): void {
    this.wishListService.getWishLists(userId).subscribe(
      (lists: WishList[]) => {
        this.wishLists = lists;
      }
    );
  }

  saveProfile(): void {
    if (this.profileForm.valid && this.profileForm.dirty) {
      this.isSavingProfile = true;
      const updatedUser: User = {
        ...this.user,
        FirstName: this.profileForm.value.firstName,
        LastName: this.profileForm.value.lastName,
        Email: this.profileForm.value.email,
        Phone: this.profileForm.value.phone,
        Country: this.profileForm.value.country
      };
      
      this.userService.updateUserProfile(updatedUser).subscribe({
        next: (success) => {
          if (success) {
            this.editMode = false;
            this.isSavingProfile = false;
          }
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.isSavingProfile = false;
        }
      });
    }
  }

  saveDeliveryAddress(): void {
    if (this.deliveryForm.valid && this.user.Id > 0) {
      this.isSavingDelivery = true;
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
      
      this.deliveryService.saveDeliveryAddress(newAddress).subscribe({
        next: (success) => {
          if (success) {
            this.loadDeliveryAddresses(this.user.Id);
            this.showAddDelivery = false;
            this.deliveryForm.reset();
          }
          this.isSavingDelivery = false;
        },
        error: (error) => {
          console.error('Error saving delivery address:', error);
          this.isSavingDelivery = false;
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
    
    // If switching to Payment tab and Stripe is loaded, mount card element
    if (tab === 'payment' && this.showAddPayment && this.stripe) {
      this.mountCardElement();
    }
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
  
  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      // Reset form to original values
      this.profileForm.patchValue({
        firstName: this.user.FirstName,
        lastName: this.user.LastName,
        email: this.user.Email,
        phone: this.user.Phone,
        country: this.user.Country
      });
    }
  }
  
  cancelEdit(): void {
    this.editMode = false;
    this.profileForm.patchValue({
      firstName: this.user.FirstName,
      lastName: this.user.LastName,
      email: this.user.Email,
      phone: this.user.Phone,
      country: this.user.Country
    });
  }

  mountCardElement(): void {
    if (this.stripe && this.cardElementRef && !this.cardElement) {
      const elements = this.stripe.elements();
      this.cardElement = elements.create('card', {
        style: {
          base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#e53e3e',
            iconColor: '#e53e3e'
          }
        }
      });
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
  
  getCardIcon(cardType: string): string {
    const type = cardType.toLowerCase();
    
    if (type.includes('visa')) {
      return 'fab fa-cc-visa';
    } else if (type.includes('master')) {
      return 'fab fa-cc-mastercard';
    } else if (type.includes('amex') || type.includes('american')) {
      return 'fab fa-cc-amex';
    } else if (type.includes('discover')) {
      return 'fab fa-cc-discover';
    } else if (type.includes('diners')) {
      return 'fab fa-cc-diners-club';
    } else if (type.includes('jcb')) {
      return 'fab fa-cc-jcb';
    } else {
      return 'far fa-credit-card';
    }
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPurchaseHistory(this.user.Id, this.currentPage);
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPurchaseHistory(this.user.Id, this.currentPage);
    }
  }
  
  createWishList(): void {
    // Implement the create wishlist functionality
    // This could navigate to a new page or open a modal dialog
    console.log('Create wishlist');
  }
  
  viewWishList(wishListId: number): void {
    // Navigate to the wishlist detail page
    console.log('View wishlist', wishListId);
  }
  
  deleteWishList(wishListId: number): void {
    if (confirm('Are you sure you want to delete this wish list?')) {
      this.wishListService.deleteWishList(wishListId).subscribe(
        (success: boolean) => {
          if (success) {
            this.loadWishLists(this.user.Id);
          }
        }
      );
    }
  }
} 