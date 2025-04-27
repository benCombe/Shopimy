import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ItemReviewsComponent } from '../item-reviews/item-reviews.component'; // Assuming this path

@Component({
  selector: 'app-item-page',
  standalone: true, // Add standalone flag
  imports: [CommonModule, CurrencyPipe, ItemReviewsComponent], // Add necessary imports
  templateUrl: './item-page.component.html',
  styleUrl: './item-page.component.css'
})
export class ItemPageComponent implements OnInit {
  @Input() itemId = 0; // Example Input, adjust as needed

  // --- Dummy Data (Replace with actual data fetching) ---
  productName = 'Sample Product';
  productPrice = 99.99;
  productDescription = 'This is a sample product description. It details the features and benefits of the item.';
  productSizes: string | null = 'S, M, L, XL';
  productDetails: string | null = 'Material: Cotton, Color: Black';
  productImages: string[] = [
    'assets/images/placeholder.png', // Replace with actual image paths
    'assets/images/placeholder2.png',
    'assets/images/placeholder3.png'
  ];
  selectedImage = 'assets/images/placeholder.png';
  isFavorite = false;
  // --- End Dummy Data ---

  constructor() { }

  ngOnInit(): void {
    // Fetch product data based on itemId here
    this.selectedImage = this.productImages[0] || 'assets/images/placeholder.png';
  }

  selectImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
  }

  addToCart(): void {
    console.log('Add to cart clicked for item:', this.itemId);
    // Implement add to cart logic using a service (e.g., ShoppingService)
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    console.log('Toggle favorite clicked. Current state:', this.isFavorite);
    // Implement favorite logic (e.g., save to user profile via service)
  }
}
