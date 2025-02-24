import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Item } from '../../models/item';
import { StoreService } from '../../services/store.service'; // or your item service

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ItemDetailComponent implements OnInit {
  item: Item | null = null;
  itemId!: string;

  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService
  ) {}

  ngOnInit(): void {
    // Extract the ID from the route parameters
    this.itemId = this.route.snapshot.paramMap.get('id')!;
    
    // Fetch the item from your service
    // If your service returns an observable, subscribe to it
    this.storeService.getItemById(this.itemId).subscribe((data: Item) => {
      this.item = data;
    });
  }

  addToBasket(item: Item) {
    console.log('Adding to basket:', item);
    // Integrate with your basket service
  }

  bookmarkItem(item: Item) {
    console.log('Bookmarking item:', item);
    // Integrate with your bookmark/favorite logic
  }
  get displayImageUrl(): string {
    if (this.item && this.item.ImageUrl && this.item.ImageUrl !== 'mock-image-url') {
      return this.item.ImageUrl;
    }
    return 'assets/images/default.png';
  }  
}
