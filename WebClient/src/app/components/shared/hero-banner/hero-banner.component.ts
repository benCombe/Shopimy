import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDetails } from '../../../models/store-details';
import { StoreTheme } from '../../../models/store-theme.model';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.css']
})
export class HeroBannerComponent {
  @Input() storeData: StoreDetails | null = null;
  @Input() theme: StoreTheme | null = null;
  
  getBannerText(): string {
    return this.storeData?.bannerText || 'Welcome to our store';
  }
  
  getThemeStyles(): Record<string, any> {
    const styles: Record<string, any> = {};
    
    // Apply direct background color
    if (this.theme) {
      styles['background-color'] = this.theme.secondColor || '#D0933D';
    } else if (this.storeData) {
      styles['background-color'] = this.storeData.theme_2 || '#D0933D';
    }
    
    // Banner section background
    if (this.theme) {
      styles['--banner-section-bg'] = this.theme.secondColor || '#D0933D';
    } else if (this.storeData) {
      styles['--banner-section-bg'] = this.storeData.theme_2 || '#D0933D';
    }
    
    // Banner text background and color
    if (this.theme) {
      styles['--banner-text-bg'] = this.theme.mainColor || '#393727';
      styles['--banner-text-color'] = this.theme.altColor || '#ffffff';
    } else if (this.storeData) {
      styles['--banner-text-bg'] = this.storeData.theme_1 || '#393727';
      styles['--banner-text-color'] = this.storeData.fontColor || '#ffffff';
    }
    
    // If there's a banner URL, use it as background image
    if (this.storeData?.bannerURL) {
      styles['background-image'] = `url(${this.storeData.bannerURL})`;
      styles['background-size'] = 'cover';
      styles['background-position'] = 'center';
    }
    
    return styles;
  }
} 