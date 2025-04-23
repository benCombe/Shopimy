import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
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
  
  // Add loading state
  isLoading: boolean = true;
  
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
  
  // Add a new property for purchase history loading state
  isPurchaseHistoryLoading: boolean = false;
  purchaseHistoryError: string | null = null;
  
  private userServiceSubscription: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private deliveryService: DeliveryService,
    private paymentService: PaymentService,
    private purchaseService: PurchaseService,
    private wishListService: WishListService,
    private fb: FormBuilder
  ) {
    // Remove form initialization from constructor since we'll do it in loadUserData
    this.initializeEmptyForms();

    // Subscribe to user service changes
    this.userServiceSubscription = this.userService.activeUser$.subscribe(user => {
      if (user && user.Id !== 0) { // Check if we have real user data
        console.log('User data from subscription:', user);
        console.log('Email value:', user.Email);
        
        this.user = user;
        
        // Format the date value if it exists
        let dateValue = user.DOB;
        if (dateValue && typeof dateValue === 'string') {
          // Try to format to YYYY-MM-DD if it's not already
          if (!dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
            try {
              const date = new Date(dateValue);
              dateValue = date.toISOString().split('T')[0];
            } catch (e) {
              console.error('Error formatting date:', e);
              dateValue = null;
            }
          }
        }
        
        // Make sure email is properly handled
        const email = user.Email || '';
        console.log('Setting email value in form:', email);
        
        this.profileForm.patchValue({
          firstName: user.FirstName,
          lastName: user.LastName,
          email: email,
          phone: user.Phone,
          address: user.Address,
          city: user.City,
          state: user.State,
          postalCode: user.PostalCode,
          country: user.Country || 'Canada', // Default value
          dateOfBirth: dateValue,
          subscribed: user.Subscribed || false
        });

        // Load additional user data
        this.loadDeliveryAddresses(user.Id);
        this.loadPaymentMethods();
        this.loadPurchaseHistory(this.currentPage);
        this.loadWishLists(user.Id);
      }
      this.isLoading = false;
    });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadStripe();
  }

  ngOnDestroy(): void {
    // Unsubscribe from user service when component is destroyed
    this.userServiceSubscription.unsubscribe();
  }

  initializeEmptyForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: [''],
      city: [''],
      state: [''],
      postalCode: [''],
      country: [''],
      dateOfBirth: [''],
      subscribed: [false]
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
    this.isLoading = true;
    
    // First check if user is logged in
    if (!this.userService.isLoggedIn()) {
      this.isLoading = false;
      return;
    }
    
    // Force a server check for updated user data
    this.userService.checkSession();
  }

  loadDeliveryAddresses(userId: number): void {
    this.deliveryService.getDeliveryAddresses(userId).subscribe(addresses => {
      this.deliveryAddresses = addresses;
    });
  }

  loadPaymentMethods(): void {
    this.paymentService.getPaymentMethods().subscribe(methods => {
      this.paymentMethods = methods;
    });
  }
  
  loadPurchaseHistory(page: number): void {
    this.isPurchaseHistoryLoading = true;
    this.purchaseHistoryError = null;
    
    this.purchaseService.getPurchaseHistory(page, this.itemsPerPage).subscribe(
      (result: PurchaseHistoryResponse) => {
        this.purchaseHistory = result.purchases;
        this.totalPages = Math.ceil(result.total / this.itemsPerPage);
        this.isPurchaseHistoryLoading = false;
      },
      (error) => {
        console.error('Error loading purchase history:', error);
        this.purchaseHistoryError = 'Failed to load purchase history. Please try again.';
        this.isPurchaseHistoryLoading = false;
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
      
      // Format the date correctly if present
      let dateOfBirth = this.profileForm.value.dateOfBirth;
      if (dateOfBirth && dateOfBirth.trim() !== '') {
        // If it's already a Date object, format it as YYYY-MM-DD
        if (dateOfBirth instanceof Date) {
          dateOfBirth = dateOfBirth.toISOString().split('T')[0];
        }
        // If it's a string but not in YYYY-MM-DD format, try to convert it
        else if (typeof dateOfBirth === 'string' && !dateOfBirth.match(/^\d{4}-\d{2}-\d{2}$/)) {
          try {
            const date = new Date(dateOfBirth);
            dateOfBirth = date.toISOString().split('T')[0];
          } catch (e) {
            console.error('Error formatting date:', e);
            dateOfBirth = null;
          }
        }
      } else {
        // Empty string or whitespace should be null
        dateOfBirth = null;
      }

      const updatedUser: User = {
        ...this.user,
        FirstName: this.profileForm.value.firstName,
        LastName: this.profileForm.value.lastName,
        Email: this.profileForm.value.email,
        Phone: this.profileForm.value.phone,
        Address: this.profileForm.value.address,
        City: this.profileForm.value.city,
        State: this.profileForm.value.state,
        PostalCode: this.profileForm.value.postalCode,
        Country: this.profileForm.value.country,
        DOB: dateOfBirth,
        Subscribed: this.profileForm.value.subscribed
      };
      
      console.log('Updating user profile with:', updatedUser);
      
      this.userService.updateUserProfile(updatedUser).subscribe({
        next: (success) => {
          if (success) {
            this.editMode = false;
            this.isSavingProfile = false;
            
            // Update the local user object with the new values
            this.user = {
              ...this.user,
              FirstName: this.profileForm.value.firstName,
              LastName: this.profileForm.value.lastName,
              Email: this.profileForm.value.email,
              Phone: this.profileForm.value.phone,
              Address: this.profileForm.value.address,
              City: this.profileForm.value.city,
              State: this.profileForm.value.state,
              PostalCode: this.profileForm.value.postalCode,
              Country: this.profileForm.value.country,
              DOB: dateOfBirth,
              Subscribed: this.profileForm.value.subscribed
            };
            
            // Force refresh user data from server to ensure display is correct
            this.userService.checkSession();
          }
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          // Log more detailed error information
          if (error.error) {
            console.error('Server error details:', error.error);
          }
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
            this.cardError = result.error.message || 'An error occurred with your card';
            this.isSavingPaymentMethod = false;
          } else if (result.setupIntent && result.setupIntent.payment_method) {
            // Send the payment method ID to our server to save
            this.paymentService.savePaymentMethod(
              typeof result.setupIntent.payment_method === 'string' 
              ? result.setupIntent.payment_method 
              : result.setupIntent.payment_method.id,
              this.newPaymentIsDefault
            ).subscribe({
              next: (success) => {
                if (success) {
                  this.loadPaymentMethods();
                  this.showAddPayment = false;
                  this.newPaymentIsDefault = false;
                }
                this.isSavingPaymentMethod = false;
              },
              error: (error) => {
                console.error('Error saving payment method:', error);
                this.cardError = 'Failed to save payment method. Please try again.';
                this.isSavingPaymentMethod = false;
              }
            });
          } else {
            this.cardError = 'An unexpected error occurred. Please try again.';
            this.isSavingPaymentMethod = false;
          }
        });
      },
      error: (error) => {
        console.error('Setup intent creation failed:', error);
        this.cardError = 'Could not process your card. Please try again.';
        this.isSavingPaymentMethod = false;
      }
    });
  }

  deleteAddress(addressId: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.deliveryService.deleteDeliveryAddress(addressId).subscribe({
        next: () => {
          this.loadDeliveryAddresses(this.user.Id);
        },
        error: (error: any) => console.error('Error deleting address:', error)
      });
    }
  }

  deletePaymentMethod(paymentId: any): void {
    if (confirm('Are you sure you want to delete this payment method?')) {
      this.paymentService.deletePaymentMethod(paymentId).subscribe({
        next: () => {
          this.loadPaymentMethods();
        },
        error: (error: any) => console.error('Error deleting payment method:', error)
      });
    }
  }

  setDefaultAddress(addressId: number): void {
    this.deliveryService.setDefaultDeliveryAddress(this.user.Id, addressId).subscribe({
      next: () => {
        this.loadDeliveryAddresses(this.user.Id);
      },
      error: (error: any) => console.error('Error setting default address:', error)
    });
  }

  setDefaultPaymentMethod(paymentMethodId: string): void {
    this.paymentService.setDefaultPaymentMethod(paymentMethodId).subscribe({
      next: () => {
        this.loadPaymentMethods();
      },
      error: (error: any) => console.error('Error setting default payment method:', error)
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    
    // Reset any forms or states when changing tabs
    if (this.editMode) {
      this.cancelEdit();
    }
    
    // Specific tab initializations
    if (tab === 'delivery') {
      this.showAddDelivery = false;
    } else if (tab === 'payments') {
      this.showAddPayment = false;
      this.unmountCardElement();
    } else if (tab === 'history') {
      this.loadPurchaseHistory(this.currentPage);
    }
  }

  toggleAddDelivery(): void {
    this.showAddDelivery = !this.showAddDelivery;
    if (!this.showAddDelivery) {
      this.deliveryForm.reset();
    }
  }

  toggleAddPayment(): void {
    this.showAddPayment = !this.showAddPayment;
    if (this.showAddPayment && this.stripe) {
      setTimeout(() => this.mountCardElement(), 0);
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
        address: this.user.Address,
        city: this.user.City,
        state: this.user.State,
        postalCode: this.user.PostalCode,
        country: this.user.Country,
        dateOfBirth: this.user.DOB,
        subscribed: this.user.Subscribed
      });
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    // Reset form to original values
    if (this.user) {
      this.profileForm.patchValue({
        firstName: this.user.FirstName,
        lastName: this.user.LastName,
        email: this.user.Email,
        phone: this.user.Phone,
        address: this.user.Address,
        city: this.user.City,
        state: this.user.State,
        postalCode: this.user.PostalCode,
        country: this.user.Country,
        dateOfBirth: this.user.DOB,
        subscribed: this.user.Subscribed
      });
    }
  }

  mountCardElement(): void {
    if (!this.stripe || !this.cardElementRef) {
      console.warn('Stripe not loaded or card element reference not available');
      return;
    }

    // First unmount to avoid duplicate elements
    this.unmountCardElement();

    // Create a card element
    const elements = this.stripe.elements();
    this.cardElement = elements.create('card', {
      style: {
        base: {
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          color: '#32325d',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a',
        },
      },
    });

    // Mount the card element
    this.cardElement.mount(this.cardElementRef.nativeElement);
  }

  unmountCardElement(): void {
    if (this.cardElement) {
      this.cardElement.unmount();
      this.cardElement = null;
    }
  }

  getCardIcon(cardType: string): string {
    const icons: { [key: string]: string } = {
      'visa': 'fa-brands fa-cc-visa',
      'mastercard': 'fa-brands fa-cc-mastercard',
      'amex': 'fa-brands fa-cc-amex',
      'discover': 'fa-brands fa-cc-discover',
      'diners': 'fa-brands fa-cc-diners-club',
      'jcb': 'fa-brands fa-cc-jcb',
      'unionpay': 'fa-credit-card'
    };

    // Return default icon if type not found
    return icons[cardType.toLowerCase()] || 'fa-regular fa-credit-card';
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPurchaseHistory(this.currentPage);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPurchaseHistory(this.currentPage);
    }
  }

  createWishList(): void {
    // Modal or form would be shown to create a new wishlist
    this.wishListService.createWishList({
      userId: this.user.Id,
      name: 'New Wishlist'
    }).subscribe(
      () => this.loadWishLists(this.user.Id)
    );
  }

  viewWishList(wishListId: number): void {
    // Navigate to wishlist detail page
  }

  deleteWishList(wishListId: number): void {
    if (confirm('Are you sure you want to delete this wishlist?')) {
      this.wishListService.deleteWishList(wishListId).subscribe(
        () => this.loadWishLists(this.user.Id)
      );
    }
  }
} 