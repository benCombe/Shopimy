import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Item } from '../../models/item';
import { StoreService } from '../../services/store.service'; // or your item service
import { ItemService } from '../../services/item.service';
import { BasicItem } from '../../models/basic-item';
import { ProductReviewsComponent } from '../product-reviews/product-reviews.component';
import { StoreDetails } from '../../models/store-details';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.css',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    ProductReviewsComponent
  ]
})
export class ItemDetailComponent implements OnInit {
  @Input() itemId!: number; // This will be set from the parent component or route
  @Input() storeDetails: StoreDetails | null = null;
  item: BasicItem | null = null;


  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    // Extract the ID from the route parameters
    this.itemId = Number(this.route.snapshot.paramMap.get('id')!);

    // Fetch the item from your service
    if (this.itemId) {
      this.itemService.getItemById(this.itemId).subscribe({
        next: (data: BasicItem) => {
          this.item = data;
        },
        error: (err) => {
          console.error(`Failed to load item with ID ${this.itemId}:`, err);
          this.item = null;
        }
      });
    } else {
      console.error('Invalid item ID from route.');
      this.item = null;
    }
  }

  addToBasket(item: BasicItem): void {
    console.log('Adding to basket:', item);
    // Integrate with your basket service
  }

  bookmarkItem(item: BasicItem): void {
    console.log('Bookmarking item:', item);
    // Integrate with your bookmark/favorite logic
  }

  get displayImageUrl(): string {
    const defaultImagePath = 'assets/images/placeholder.png';
    if (this.item && this.item.blob && this.item.blob !== 'mock-image-url') {
      return this.item.blob;
    }
    return defaultImagePath;
  }
}
