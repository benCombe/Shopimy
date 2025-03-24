import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { DeliveryService } from '../../../services/delivery.service';
import { PaymentService } from '../../../services/payment.service';
import { User } from '../../../models/user';
import { DeliveryDetails } from '../../../models/delivery-details';
import { PaymentDetails } from '../../../models/payment-details';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user!: User;
  deliveryAddresses: DeliveryDetails[] = [];
  paymentMethods: any[] = [];
  
  profileForm!: FormGroup;
  deliveryForm!: FormGroup;
  paymentForm!: FormGroup;
  
  activeTab: string = 'profile';
  showAddDelivery: boolean = false;
  showAddPayment: boolean = false;
  
  constructor(
    private userService: UserService,
    private deliveryService: DeliveryService,
    private paymentService: PaymentService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserData();
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

    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      cardHolderName: ['', Validators.required],
      expiryMonth: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])$')]],
      expiryYear: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
      isDefault: [false]
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

      // Load delivery addresses
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
      
      // Update user profile through user service
      // This method would need to be added to the user service
      this.userService.updateUserProfile(updatedUser).subscribe(success => {
        if (success) {
          // Display success message
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
    if (this.paymentForm.valid && this.user.Id > 0) {
      const newPayment = new PaymentDetails(
        this.user.Id,
        this.paymentForm.value.cardNumber,
        this.paymentForm.value.cardHolderName,
        this.paymentForm.value.expiryMonth,
        this.paymentForm.value.expiryYear,
        this.paymentForm.value.cvv
      );
      
      this.paymentService.savePaymentInformation(newPayment).subscribe(success => {
        if (success) {
          this.loadPaymentMethods(this.user.Id);
          this.showAddPayment = false;
          this.paymentForm.reset();
        }
      });
    }
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

  deletePaymentMethod(paymentId: number): void {
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

  setDefaultPaymentMethod(paymentId: number): void {
    this.paymentService.setDefaultPaymentMethod(this.user.Id, paymentId).subscribe(success => {
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
      this.paymentForm.reset();
    }
  }
} 