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
  
  getLogoText(): string {
    return this.storeData?.logoText || this.storeData?.name || 'Store Name';
  }
  
  navigateToHome(): void {
    this.router.navigate(['/']);
  }
  
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