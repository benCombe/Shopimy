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
    // Set default values
    const styles: { [key: string]: string } = {
      '--header-bg-color': '#393727',
      '--header-text-color': '#ffffff'
    };
    
    // First try to use the theme input
    if (this.theme) {
      styles['--header-bg-color'] = this.theme.mainColor || '#393727';
      styles['--header-text-color'] = this.theme.altColor || '#ffffff';
    }
    // Fallback to using storeData styles directly if theme isn't available
    else if (this.storeData) {
      styles['--header-bg-color'] = this.storeData.theme_1 || '#393727';
      styles['--header-text-color'] = this.storeData.fontColor || '#ffffff';
    }
    
    return styles;
  }
} 