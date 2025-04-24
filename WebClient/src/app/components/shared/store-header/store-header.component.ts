import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDetails } from '../../../models/store-details';
import { StoreTheme } from '../../../models/store-theme.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-store-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store-header.component.html',
  styleUrls: ['./store-header.component.css']
})
export class StoreHeaderComponent {
  @Input() storeData: StoreDetails | null = null;
  @Input() theme: StoreTheme | null = null;
  
  constructor(private router: Router) {}
  
  /**
   * Gets the text to display in the store logo
   * Prioritizes logoText, falls back to store name, then default text
   */
  getLogoText(): string {
    return this.storeData?.logoText || this.storeData?.name || 'Store Name';
  }
  
  /**
   * Navigates back to the home/main page of the store
   * Uses the store URL if available
   */
  navigateToHome(): void {
    if (this.storeData?.url) {
      this.router.navigate([`/${this.storeData.url}`]);
    } else {
      this.router.navigate(['/']);
    }
  }
  
  /**
   * Generates the inline CSS style object for the header based on theme settings
   * Prioritizes the theme input, falls back to storeData values, then default colors
   */
  getThemeStyles(): { [key: string]: string } {
    // Set default values with fallbacks
    const styles: { [key: string]: string } = {};
    
    // Apply direct background color
    if (this.theme) {
      styles['background-color'] = this.theme.mainColor || '#393727';
      styles['--header-bg-color'] = this.theme.mainColor || '#393727';
      styles['--header-text-color'] = this.theme.altColor || '#ffffff';
      styles['--header-hover-color'] = this.theme.thirdColor || '#D3CEBB';
      styles['--header-logo-bg'] = this.theme.secondColor || '#D0933D';
      styles['--header-shadow-color'] = 'rgba(0, 0, 0, 0.1)';
    }
    // Fallback to using storeData styles directly if theme isn't available
    else if (this.storeData) {
      styles['background-color'] = this.storeData.theme_1 || '#393727';
      styles['--header-bg-color'] = this.storeData.theme_1 || '#393727';
      styles['--header-text-color'] = this.storeData.fontColor || '#ffffff';
      styles['--header-hover-color'] = this.storeData.theme_3 || '#D3CEBB';
      styles['--header-logo-bg'] = this.storeData.theme_2 || '#D0933D';
      styles['--header-shadow-color'] = 'rgba(0, 0, 0, 0.1)';
    }
    
    return styles;
  }
} 