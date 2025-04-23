import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDetails } from '../../../models/store-details';
import { StoreTheme } from '../../../models/store-theme.model';

@Component({
  selector: 'app-store-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store-footer.component.html',
  styleUrls: ['./store-footer.component.css']
})
export class StoreFooterComponent {
  @Input() storeData: StoreDetails | null = null;
  @Input() theme: StoreTheme | null = null;
  
  getCurrentYear(): number {
    return new Date().getFullYear();
  }
  
  getStoreName(): string {
    return this.storeData?.name || 'Store Name';
  }
  
  getThemeStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    
    if (this.theme) {
      styles['--footer-bg'] = this.theme.mainColor || '#393727';
      styles['--footer-text-color'] = this.theme.altColor || '#ffffff';
    } else if (this.storeData) {
      styles['--footer-bg'] = this.storeData.theme_1;
      styles['--footer-text-color'] = this.storeData.fontColor;
    }
    
    return styles;
  }
} 