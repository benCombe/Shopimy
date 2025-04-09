import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Define interfaces for the promotion data
export interface PromoCodeData {
  type: string;
  discountPercentage: number;
  category?: string;
  categoryDiscount?: number;
}

export interface PromoMessageData {
  promoCode: string;
  message: string;
  targetAudience: 'previous' | 'favorited';
}

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.css'
})
export class PromotionsComponent {
  // Output emitters to send data back to parent component
  @Output() promoCodeCreated = new EventEmitter<PromoCodeData>();
  @Output() promoMessageSent = new EventEmitter<PromoMessageData>();
  
  // Data models for forms
  promoData: PromoCodeData = {
    type: 'storeWide',
    discountPercentage: 0,
    category: '',
    categoryDiscount: 0
  };
  
  previousCustomersData: PromoMessageData = {
    promoCode: '',
    message: '',
    targetAudience: 'previous'
  };
  
  favoritedCustomersData: PromoMessageData = {
    promoCode: '',
    message: '',
    targetAudience: 'favorited'
  };

  // Create promo code and emit the data
  createPromo() {
    // Create a copy of the data to emit
    const promoToEmit: PromoCodeData = {
      type: this.promoData.type || 'storeWide',
      discountPercentage: this.promoData.discountPercentage
    };
    
    // Add category data if it's a category-specific discount
    if (this.promoData.type === 'categorySpecific') {
      promoToEmit.category = this.promoData.category;
      promoToEmit.categoryDiscount = this.promoData.categoryDiscount;
    }
    
    // Emit the event with the data
    this.promoCodeCreated.emit(promoToEmit);
    console.log('Creating promo code', promoToEmit);
    
    // Reset form data
    this.promoData = {
      type: 'storeWide',
      discountPercentage: 0,
      category: '',
      categoryDiscount: 0
    };
  }
  
  // Send promo to previous customers and emit the data
  sendToPreviousCustomers() {
    this.promoMessageSent.emit({...this.previousCustomersData});
    console.log('Sending to previous customers', this.previousCustomersData);
    
    // Reset form data
    this.previousCustomersData = {
      promoCode: '',
      message: '',
      targetAudience: 'previous'
    };
  }
  
  // Send promo to favorited customers and emit the data
  sendToFavoritedCustomers() {
    this.promoMessageSent.emit({...this.favoritedCustomersData});
    console.log('Sending to favorited customers', this.favoritedCustomersData);
    
    // Reset form data
    this.favoritedCustomersData = {
      promoCode: '',
      message: '',
      targetAudience: 'favorited'
    };
  }
}
