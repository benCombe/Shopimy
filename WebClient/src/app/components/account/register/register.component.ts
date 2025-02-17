import { UserService } from './../../../services/user.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TopNavComponent } from "../../top-nav/top-nav.component";
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistrationDetails } from '../../../models/registration-details';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [TopNavComponent, NgIf, NgFor, FormsModule, NgClass, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  imgURL: string = "resources/images/workfromhome.jpg"

  //form variables
  firstname: string = "";
  lastname: string = "";
  email: string = "";
  phone: string = "";
  address: string = "";
  provState: string = "";
  zip: string = "";
  dob: Date | null = null;
  selectedCountry: string = "";

  password: string = "";
  confirmPassword: string = ""

  subscribed: boolean = false;
  acceptTAC: boolean = false;

  //password check
  hasValidLength: boolean = false;
  hasUpperLower: boolean = false;
  pwMatch: boolean = false;

  // Validation state flags
  isFirstNameValid: boolean = true;
  isLastNameValid: boolean = true;
  isEmailValid: boolean = true;
  isPhoneValid: boolean = true;
  isDobValid: boolean = true;
  isPasswordValid: boolean = true;
  isConfirmPasswordValid: boolean = true;


  dataValid: boolean = false;

  countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' }
  ];

  constructor(private userService: UserService, private router: Router){}

  ngOnInit() {
    //this.selectedCountry = this.countries[0].value;
   /*  this.cd.detectChanges(); // Force Angular to detect changes on load */
    //this.checkStength();
  }

  concatAddr(): string{
    return this.address + ", " + this.provState + ", " + this.zip;
  }

  // ✅ First Name & Last Name Validation: 1-50 characters, letters only
  validateFirstName(): boolean {
    this.isFirstNameValid = /^[a-zA-Z]{1,50}$/.test(this.firstname);
    console.log("Valid Firstname: " + this.isFirstNameValid);
    return this.isFirstNameValid;
  }

  validateLastName(): boolean {
    this.isLastNameValid = /^[a-zA-Z]{1,50}$/.test(this.lastname);
    return this.isLastNameValid;
  }

  // ✅ Email Validation: Must be in valid email format
  validateEmail(): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.isEmailValid = emailPattern.test(this.email);
    return this.isEmailValid;
  }

  // ✅ Phone Validation: Must match (###) - ### - #### format
  validatePhone(): boolean {
    const phonePattern = /^(\d{3}-\d{3}-\d{4}|\d{10})$/;
    this.isPhoneValid = phonePattern.test(this.phone);
    return this.isPhoneValid;
  }

  // ✅ Date of Birth Validation: Must be at least 18 years old
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

  // ✅ Password Strength Check
  validatePassword(): boolean {
    this.hasValidLength = this.password.length >= 8 && this.password.length <= 20;
    const hasUpper = /[A-Z]/.test(this.password);
    const hasLower = /[a-z]/.test(this.password);
    const hasNumber = /\d/.test(this.password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);

    this.hasUpperLower = hasUpper && hasLower && hasNumber && hasSymbol
    this.isPasswordValid = this.hasValidLength && this.hasUpperLower;
    return this.isPasswordValid;
  }

  // ✅ Confirm Password Check
  validateConfirmPassword(): boolean {
    this.pwMatch = this.isConfirmPasswordValid = this.password === this.confirmPassword;
    return this.isConfirmPasswordValid;
  }

  // ✅ Overall Form Validation
  isFormValid(): boolean {
    return (
      this.validateFirstName() &&
      this.validateLastName() &&
      this.validateEmail() &&
      this.validatePhone() &&
      this.validateDOB() &&
      this.validatePassword() &&
      this.validateConfirmPassword() &&
      this.acceptTAC
    );
  }


  register(): void{
    if(this.isFormValid()){
      const user = new RegistrationDetails(this.firstname, this.lastname,
                                           this.email, this.phone,
                                           this.concatAddr(), this.selectedCountry.toUpperCase(),
                                           this.dob, this.password, this.subscribed);

      this.userService.register(user).subscribe({
        next: () => {
          console.log('Registration Successful, Logging in...'),
          this.router.navigate(['/dashboard']);
        },
        error: err => console.error("Registartion Failed", err)
      });
    }
  }

}
