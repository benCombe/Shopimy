import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreDetails } from '../../../models/store-details';

@Component({
  selector: 'app-themes',
  imports: [CommonModule, FormsModule],
  templateUrl: './themes.component.html',
  styleUrl: './themes.component.css',
  standalone: true
})
export class ThemesComponent implements OnInit {
  logoPreviewUrl: string = 'resources/images/placeholder-logo.png';
  bannerPreviewUrl: string = 'resources/images/placeholder-banner.png';
  selectedFont: string = 'Calibri';
  selectedFontSize: string = '16px';
  
  // Color selection properties
  primaryColor: string = '#cccccc';
  secondaryColor: string = '#808080';
  fontColor: string = '#ffffff';

  // Banner text properties
  bannerText: string = '';
  bannerFontSize: string = '24px';
  bannerTextColor: string = '#ffffff';
  bannerTextAlignment: string = 'center';

  // Logo text properties
  logoText: string = '';
  logoFontSize: string = '14px';
  logoTextColor: string = '#000000';
  logoTextAlignment: string = 'center';
  
  // Selected layout
  selectedLayout: string = 'layout-1';
  
  // Store details reference
  storeDetails: StoreDetails = new StoreDetails(1, '', 'My Store', '#cccccc', '#808080', '#ffffff', '#000000', 'Calibri', '', '', []);

  ngOnInit(): void {
    // Load form values from store details
    this.loadFromStoreDetails();
  }

  loadFromStoreDetails(): void {
    // Set form values from store details
    this.primaryColor = this.storeDetails.theme_1;
    this.secondaryColor = this.storeDetails.theme_2;
    this.fontColor = this.storeDetails.theme_3;
    this.selectedFont = this.storeDetails.fontFamily;
    this.bannerText = this.storeDetails.bannerText;
    this.logoText = this.storeDetails.logoText;
    
    // Set logo and banner URLs if they exist
    if (this.storeDetails.LogoUrl) {
      this.logoPreviewUrl = this.storeDetails.LogoUrl;
    }
  }

  updateStoreDetails(): void {
    // Update store details from form values
    this.storeDetails.theme_1 = this.primaryColor;
    this.storeDetails.theme_2 = this.secondaryColor;
    this.storeDetails.theme_3 = this.fontColor;
    this.storeDetails.fontFamily = this.selectedFont;
    this.storeDetails.fontColor = this.fontColor;
    this.storeDetails.bannerText = this.bannerText;
    this.storeDetails.logoText = this.logoText;
    
    console.log('Store details updated:', this.storeDetails);
    // Here you would typically save the store details to a service
  }

  onColorChange(event: Event, colorType: 'primary' | 'secondary' | 'font'): void {
    const input = event.target as HTMLInputElement;
    if (colorType === 'primary') {
      this.primaryColor = input.value;
    } else if (colorType === 'secondary') {
      this.secondaryColor = input.value;
    } else if (colorType === 'font') {
      this.fontColor = input.value;
    }
    // Update store details when colors change
    this.updateStoreDetails();
  }

  onLayoutChange(layout: string): void {
    this.selectedLayout = layout;
    // You might want to store the selected layout in store details as well
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreviewUrl = reader.result as string;
        // Update LogoUrl in store details
        this.storeDetails.LogoUrl = this.logoPreviewUrl;
      };
      reader.readAsDataURL(file);
    }
  }

  onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Create a preview URL for the selected banner image
      const reader = new FileReader();
      reader.onload = () => {
        this.bannerPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onFontChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedFont = select.value;
    this.updateStoreDetails();
  }

  onFontSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedFontSize = select.value;
  }

  // Add method to handle banner text alignment changes
  onBannerAlignmentChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.bannerTextAlignment = select.value;
    // Update store details when alignment changes
    this.updateStoreDetails();
  }
}
