import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Item } from '../../models/item';
import { StoreService } from '../../services/store.service'; // or your item service
import { ItemService } from '../../services/item.service';
import { BasicItem } from '../../models/basic-item';
import { ProductReviewsComponent } from '../product-reviews/product-reviews.component';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.css',
  standalone: true,
  imports: [
    CommonModule,
    ProductReviewsComponent
  ]
})
export class ItemDetailComponent implements OnInit {

  item: BasicItem | null = null;
  itemId!: number;

  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    // Extract the ID from the route parameters
    this.itemId = Number(this.route.snapshot.paramMap.get('id')!);

    // Fetch the item from your service
    // If your service returns an observable, subscribe to it
    this.itemService.getItemById(this.itemId).subscribe((data: BasicItem) => {
      this.item = data;
    });
  }

  addToBasket(item: BasicItem) {
    console.log('Adding to basket:', item);
    // Integrate with your basket service
  }

  bookmarkItem(item: BasicItem) {
    console.log('Bookmarking item:', item);
    // Integrate with your bookmark/favorite logic
  }

  get displayImageUrl(): string {
    if (this.item && this.item.blob && this.item.blob !== 'mock-image-url') {
      return this.item.blob;
    }
    return 'assets/images/default.png';
  }
}
