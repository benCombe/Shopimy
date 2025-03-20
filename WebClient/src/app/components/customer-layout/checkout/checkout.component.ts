import { CommonModule, NgIf } from '@angular/common';
import { AfterViewInit, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import { StoreNavComponent } from "../store-nav/store-nav.component";
import { ThemeService } from '../../../services/theme.service';
import { StoreDetails } from '../../../models/store-details';
import { OrderSummaryComponent } from "../order-summary/order-summary.component";

@Component({
  selector: 'app-checkout',
  imports: [NgIf, CommonModule, ReactiveFormsModule, StoreNavComponent, OrderSummaryComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})

export class CheckoutComponent implements AfterViewInit{

  @Input() storeDetails: StoreDetails | null = null;

  currentStep = 1; // Track the current panel

  shippingForm: FormGroup;
  paymentForm: FormGroup;

  constructor(private fb: FormBuilder, private themeService: ThemeService) {
    this.shippingForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]], // Allow 10-15 digit phone numbers
    });

    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
      expiration: ['', Validators.required],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
    });
  }

  ngAfterViewInit(): void {
    /* this.themeService.setThemeOne("theme1");
    this.themeService.setThemeTwo("theme2");
    this.themeService.setThemeThree("theme3");
    this.themeService.setFontColor("fc");
    this.themeService.setButtonHoverColor("hover"); */
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  submitOrder() {
    if (this.shippingForm.valid && this.paymentForm.valid) {
      console.log('Order submitted:', {
        shipping: this.shippingForm.value,
        payment: this.paymentForm.value,
      });
      alert('Order placed successfully!');
    }
  }
}
