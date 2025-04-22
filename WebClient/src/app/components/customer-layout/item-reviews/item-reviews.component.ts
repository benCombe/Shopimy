import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-reviews.component.html',
  styleUrl: './item-reviews.component.css'
})
export class ItemReviewsComponent implements OnInit {
  @Input() itemId: number | undefined;

  // Placeholder for reviews data
  reviews: any[] = []; // Replace 'any' with a proper Review model later

  constructor() { }

  ngOnInit(): void {
    if (this.itemId) {
      console.log('ItemReviewsComponent initialized for itemId:', this.itemId);
      // Fetch reviews based on this.itemId here
    } else {
      console.warn('ItemReviewsComponent initialized without an itemId.');
    }
  }
}
