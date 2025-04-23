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
  @Input() isPreview: boolean = false;
  
  itemIds: number[] = [];
  displayCount: number = 6;
  loading: boolean = false;
  
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
  
  getThemeStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    
    if (this.theme) {
      styles['--featured-bg'] = this.theme.thirdColor || '#D3CEBB';
      styles['--featured-heading-color'] = this.theme.mainColor || '#393727';
      styles['--action-button-bg'] = this.theme.secondColor || '#D0933D';
    } else if (this.storeData) {
      styles['--featured-bg'] = this.storeData.theme_3;
      styles['--featured-heading-color'] = this.storeData.theme_1;
      styles['--action-button-bg'] = this.storeData.theme_2;
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