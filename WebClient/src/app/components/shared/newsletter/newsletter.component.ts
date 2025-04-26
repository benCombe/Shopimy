import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreDetails } from '../../../models/store-details';
import { StoreTheme } from '../../../models/store-theme.model';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.css']
})
export class NewsletterComponent implements OnInit {
  newsletterForm: FormGroup;
  submitted = false;
  success = false;
  error = false;
  isSubmitting = false;
  @Input() storeData: StoreDetails | null = null;
  @Input() theme: StoreTheme | null = null;
  
  constructor(private fb: FormBuilder) {
    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
  }

  getThemeStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    
    if (this.theme) {
      // Apply theme colors directly
      styles['--main-color'] = this.theme.mainColor || '#393727';
      styles['--second-color'] = this.theme.secondColor || '#D0933D';
      styles['--third-color'] = this.theme.thirdColor || 'rgba(255, 255, 255, 0.2)';
      styles['--alt-color'] = this.theme.altColor || '#ffffff';
    } else if (this.storeData) {
      // Apply store colors directly
      styles['--main-color'] = this.storeData.theme_1 || '#393727';
      styles['--second-color'] = this.storeData.theme_2 || '#D0933D';
      styles['--third-color'] = this.storeData.theme_3 || 'rgba(255, 255, 255, 0.2)';
      styles['--alt-color'] = this.storeData.fontColor || '#ffffff';
    }
    
    return styles;
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.newsletterForm.valid) {
      this.isSubmitting = true;
      this.error = false;
      // Simulate API call success
      setTimeout(() => {
        this.success = true;
        this.isSubmitting = false;
        this.newsletterForm.reset();
        this.submitted = false;
        setTimeout(() => this.success = false, 3000);
      }, 1000);
    }
  }

  get email() {
    return this.newsletterForm.get('email');
  }
} 