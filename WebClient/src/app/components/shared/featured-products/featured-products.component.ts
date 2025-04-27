import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDetails } from '../../../models/store-details';
import { StoreTheme } from '../../../models/store-theme.model';
import { ItemCardComponent } from '../../item-card/item-card.component';
import { StoreService } from '../../../services/store.service';
import { LoadingOneComponent } from '../../utilities/loading-one/loading-one.component';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [CommonModule, ItemCardComponent, LoadingOneComponent],
  templateUrl: './featured-products.component.html',
  styleUrls: [
    './featured-products.component.css',
    '../styles/section-headings.css'
  ]
})
export class FeaturedProductsComponent implements OnInit {
  @Input() storeData: StoreDetails | null = null;
  @Input() theme: StoreTheme | null = null;
  @Input() isPreview = false;
  
  itemIds: number[] = [];
  displayCount = 6;
  loading = false;
  
  constructor(private storeService: StoreService) {}
  
  ngOnInit(): void {
    if (this.storeData && !this.isPreview) {
      this.fetchItemIds();
    }
  }
  
  private fetchItemIds(): void {
    if (!this.storeData || !this.storeData.id) return;
    
    this.loading = true;
    this.storeService.getRandomItemIdsByStore(this.storeData.id).subscribe({
      next: (ids) => {
        this.itemIds = ids;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching item IDs:', err);
        this.loading = false;
      }
    });
  }
  
  loadMore(): void {
    if (this.displayCount < this.itemIds.length) {
      this.displayCount = Math.min(this.displayCount + 6, this.itemIds.length);
    }
  }
  
  getThemeStyles(): Record<string, string> {
    const styles: Record<string, string> = {};
    
    if (this.theme) {
      // Apply direct background style
      styles['background-color'] = this.theme.thirdColor || '#D3CEBB';
      
      // Featured products section specific variables
      styles['--featured-bg'] = this.theme.thirdColor || '#D3CEBB';
      styles['--featured-heading-color'] = this.theme.mainColor || '#393727';
      styles['--featured-heading-underline'] = this.theme.secondColor || '#D0933D';
      styles['--action-button-bg'] = this.theme.secondColor || '#D0933D';
      styles['--action-button-color'] = this.theme.altColor || '#FFFFFF';
      styles['--product-card-bg'] = this.theme.altColor || '#FFFFFF';
      styles['--product-title-color'] = this.theme.mainColor || '#393727';
      styles['--product-price-color'] = this.theme.secondColor || '#D0933D';
    } else if (this.storeData) {
      // Apply direct background style
      styles['background-color'] = this.storeData.theme_3 || '#D3CEBB';
      
      // Featured products section specific variables
      styles['--featured-bg'] = this.storeData.theme_3 || '#D3CEBB';
      styles['--featured-heading-color'] = this.storeData.theme_1 || '#393727';
      styles['--featured-heading-underline'] = this.storeData.theme_2 || '#D0933D';
      styles['--action-button-bg'] = this.storeData.theme_2 || '#D0933D';
      styles['--action-button-color'] = this.storeData.fontColor || '#FFFFFF';
      styles['--product-card-bg'] = this.storeData.fontColor || '#FFFFFF';
      styles['--product-title-color'] = this.storeData.theme_1 || '#393727';
      styles['--product-price-color'] = this.storeData.theme_2 || '#D0933D';
    }
    
    return styles;
  }
  
  // For preview mode, generate sample item IDs
  getSampleItemIds(): number[] {
    return [1, 2, 3, 4, 5, 6];
  }
  
  // Fixed method to get formatted price for sample items
  getSamplePrice(id: number): string {
    const basePrice = 19.99 + (id * 5);
    return basePrice.toFixed(2);
  }
  
  shouldShowLoadMoreButton(): boolean {
    return !this.isPreview && this.displayCount < this.itemIds.length;
  }
} 