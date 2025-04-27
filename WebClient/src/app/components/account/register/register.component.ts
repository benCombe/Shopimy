import { UserService } from './../../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistrationDetails } from '../../../models/registration-details';
import { Router, RouterLink } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  // Form variables
  firstname = "";
  lastname = "";
  email = "";
  phone = "";
  address = "";
  provState = "";
  zip = "";
  dob: Date | null = null;
  selectedCountry = "";

  password = "";
  confirmPassword = "";
  
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  subscribed = false;
  acceptTAC = false;

  // Registration status
  registrationSuccess = false;
  registrationError = "";

  // Password check
  hasValidLength = false;
  hasUpperLower = false;
  pwMatch = false;

  // Validation state flags
  isFirstNameValid = true;
  isLastNameValid = true;
  isEmailValid = true;
  isPhoneValid = true;
  isDobValid = true;
  isPasswordValid = true;
  isConfirmPasswordValid = true;

  countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' }
  ];

  constructor(
    private userService: UserService, 
    private router: Router, 
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    // Initialize with default country
    if (this.countries.length > 0) {
      this.selectedCountry = this.countries[0].value;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  concatAddr(): string {
    return this.address + ", " + this.provState + ", " + this.zip;
  }

  // First Name & Last Name Validation: 1-50 characters, letters only
  validateFirstName(): boolean {
    this.isFirstNameValid = /^[a-zA-Z]{1,50}$/.test(this.firstname);
    return this.isFirstNameValid;
  }

  validateLastName(): boolean {
    this.isLastNameValid = /^[a-zA-Z]{1,50}$/.test(this.lastname);
    return this.isLastNameValid;
  }

  // Email Validation: Must be in valid email format
  validateEmail(): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.isEmailValid = emailPattern.test(this.email);
    return this.isEmailValid;
  }

  // Phone Validation: Must match ###-###-#### format
  validatePhone(): boolean {
    const phonePattern = /^(\d{3}-\d{3}-\d{4}|\d{10})$/;
    this.isPhoneValid = phonePattern.test(this.phone);
    return this.isPhoneValid;
  }

  // Format phone number as user types
  formatPhoneNumber(event: any): void {
    // Get input value and remove all non-digits
    const input = event.target.value.replace(/\D/g, '');
    
    // Check if we have enough digits to format
    if (input.length > 0) {
      // Format the phone number as ###-###-####
      if (input.length <= 3) {
        this.phone = input;
      } else if (input.length <= 6) {
        this.phone = `${input.slice(0, 3)}-${input.slice(3)}`;
      } else {
        this.phone = `${input.slice(0, 3)}-${input.slice(3, 6)}-${input.slice(6, 10)}`;
      }
    } else {
      this.phone = input;
    }
  }

  // Date of Birth Validation: Must be at least 18 years old
  validateDOB(): boolean {
    if (!this.dob) {
      this.isDobValid = false;
      return false;
    }
    const birthDate = new Date(this.dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    this.isDobValid = age > 18 || (age === 18 && today >= new Date(birthDate.setFullYear(today.getFullYear())));
    return this.isDobValid;
  }

  // Password Strength Check
  validatePassword(): boolean {
    this.hasValidLength = this.password.length >= 8 && this.password.length <= 20;
    const hasUpper = /[A-Z]/.test(this.password);
    const hasLower = /[a-z]/.test(this.password);
    const hasNumber = /\d/.test(this.password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);

    this.hasUpperLower = hasUpper && hasLower && hasNumber && hasSymbol;
    this.isPasswordValid = this.hasValidLength && this.hasUpperLower;
    this.validateConfirmPassword(); // Update password match when password changes
    return this.isPasswordValid;
  }

  // Confirm Password Check
  validateConfirmPassword(): boolean {
    this.pwMatch = this.password === this.confirmPassword;
    this.isConfirmPasswordValid = this.pwMatch;
    return this.isConfirmPasswordValid;
  }

  // Overall Form Validation
  isFormValid(): boolean {
    return (
      this.validateFirstName() &&
      this.validateLastName() &&
      this.validateEmail() &&
      this.validatePhone() &&
      this.validateDOB() &&
      this.validatePassword() &&
      this.validateConfirmPassword() &&
      !!this.selectedCountry &&
      !!this.address &&
      !!this.provState &&
      !!this.zip &&
      this.acceptTAC
    );
  }

  register(): void {
    if (this.isFormValid()) {
      this.isLoading = true;
      this.registrationSuccess = false;
      this.registrationError = "";
      
      const user = new RegistrationDetails(
        this.firstname, 
        this.lastname,
        this.email, 
        this.phone,
        this.concatAddr(), 
        this.selectedCountry.toUpperCase(),
        this.dob, 
        this.password, 
        this.subscribed
      );

      this.userService.register(user).subscribe({
        next: () => {
          console.log('Registration Successful');
          this.registrationSuccess = true;
          this.isLoading = false;
          
          // Wait 3 seconds then redirect to login page
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: err => {
          console.error("Registration Failed", err);
          this.registrationError = err.error || "Registration failed. Please try again.";
          this.isLoading = false;
        }
      });
    }
  }
}
