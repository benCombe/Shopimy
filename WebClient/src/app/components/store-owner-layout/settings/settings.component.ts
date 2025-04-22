import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../models/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup;
  paymentForm: FormGroup;
  currentUser: User | null = null;
  isEditing = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  
  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      FirstName: ['', Validators.required],
      LastName: ['', Validators.required],
      Email: [{value: '', disabled: true}],
      Phone: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\(\)\s]+$/)]],
      Address: ['', Validators.required],
      City: ['', Validators.required],
      State: ['', Validators.required],
      PostalCode: ['', Validators.required],
      Country: ['', Validators.required],
      DOB: [''],
      Subscribed: [false]
    });

    this.paymentForm = this.fb.group({
      PaymentMethod: [''],
      CardNumber: [''],
      CardExpiryDate: [''],
      CVV: ['']
    });
  }

  ngOnInit() {
    this.loadUserProfile();
    
    // Subscribe to user updates
    this.userService.activeUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.updateFormWithUserData(user);
      }
    });
  }

  loadUserProfile() {
    this.userService.getUserProfile().subscribe({
      next: (userData) => {
        this.currentUser = userData as User;
        this.updateFormWithUserData(userData);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.errorMessage = 'Failed to load user profile. Please try again.';
      }
    });
  }

  updateFormWithUserData(user: any) {
    // Format DOB if exists
    let dobValue = '';
    if (user.dob || user.DOB) {
      const dobDate = new Date(user.dob || user.DOB);
      if (!isNaN(dobDate.getTime())) {
        // Format to YYYY-MM-DD for input[type=date]
        dobValue = dobDate.toISOString().split('T')[0];
      }
    }

    this.profileForm.patchValue({
      FirstName: user.firstName || user.FirstName || '',
      LastName: user.lastName || user.LastName || '',
      Email: user.email || user.Email || '',
      Phone: user.phone || user.Phone || '',
      Address: user.address || user.Address || '',
      City: user.city || user.City || '',
      State: user.state || user.State || user.province || user.Province || '',
      PostalCode: user.postalCode || user.PostalCode || '',
      Country: user.country || user.Country || '',
      DOB: dobValue,
      Subscribed: user.subscribed || user.Subscribed || false
    });

    // Handle payment information if available
    if (user.paymentMethod || user.PaymentMethod) {
      this.paymentForm.patchValue({
        PaymentMethod: user.paymentMethod || user.PaymentMethod || '',
        CardExpiryDate: user.cardExpiryDate || user.CardExpiryDate || '',
        // Only show last four digits if available
        CardNumber: user.lastFourDigits || user.LastFourDigits ? 
          `**** **** **** ${user.lastFourDigits || user.LastFourDigits}` : ''
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.isEditing) {
      // Reset form if canceling edit
      this.updateFormWithUserData(this.currentUser);
    }
  }

  saveProfile() {
    if (!this.profileForm.valid) {
      this.errorMessage = 'Please fill out all required fields.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Parse DOB from string to Date if it exists
    let dob = null;
    const dobStr = this.profileForm.get('DOB')?.value;
    if (dobStr) {
      dob = new Date(dobStr);
    }

    const updatedUser = new User(
      this.currentUser?.Id || 0,
      this.profileForm.get('FirstName')?.value,
      this.profileForm.get('LastName')?.value,
      this.currentUser?.Email || '',
      this.profileForm.get('Phone')?.value,
      this.profileForm.get('Address')?.value,
      this.profileForm.get('Country')?.value,
      null, // Password field is never updated through this form
      this.currentUser?.Verified || false,
      this.profileForm.get('City')?.value,
      this.profileForm.get('State')?.value,
      this.profileForm.get('PostalCode')?.value,
      this.currentUser?.PaymentMethod || null,
      this.currentUser?.LastFourDigits || null,
      this.currentUser?.CardExpiryDate || null
    );

    // Add any additional properties that aren't in the constructor
    (updatedUser as any).DOB = dob;
    (updatedUser as any).Subscribed = this.profileForm.get('Subscribed')?.value || false;

    this.userService.updateUserProfile(updatedUser).subscribe({
      next: (success) => {
        this.isSaving = false;
        if (success) {
          this.isEditing = false;
          this.successMessage = 'Profile updated successfully!';
          
          // Success message will be cleared after 5 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        }
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error updating profile:', error);
        this.errorMessage = 'Failed to update profile. Please try again.';
      }
    });
  }

  saveSettings() {
    // Simple function that just consolidates all saving actions
    this.saveProfile();
  }
}
