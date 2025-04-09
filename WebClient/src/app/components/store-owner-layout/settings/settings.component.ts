import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

export interface PaymentInfo {
  creditCard: string;
  expDate: string;
  cvv: string;
  address: string;
  email: string;
  phone: string;
  birthday: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  @Output() paymentInfoSaved = new EventEmitter<PaymentInfo>();
  
  paymentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.paymentForm = this.fb.group({
      creditCard: ['', [Validators.required]],
      expDate: ['', [Validators.required]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
      address: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      birthday: ['']
    });
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      const paymentInfo: PaymentInfo = this.paymentForm.value;
      console.log('Payment information submitted:', paymentInfo);
      this.paymentInfoSaved.emit(paymentInfo);
      alert('Payment information saved successfully!');
    } else {
      console.log('Form is invalid. Please check required fields.');
      alert('Please fill in all required fields correctly.');
    }
  }
}
