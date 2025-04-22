import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemCardComponent } from '../../item-card/item-card.component';
import { ItemService } from '../../../services/item.service';
import { BasicItem } from '../../../models/basic-item';

@Component({
  selector: 'app-recommended-items',
  standalone: true,
  imports: [CommonModule, ItemCardComponent],
  templateUrl: './recommended-items.component.html',
  styleUrls: ['./recommended-items.component.css']
})
export class RecommendedItemsComponent implements OnInit {
  @Input() currentItemId: number | null = null;
  @Input() categoryId: number | null = null;
  @Input() limit: number = 4;

  recommendedItems: BasicItem[] = [];
  isLoading: boolean = false;
  errorLoading: boolean = false;

  constructor(private itemService: ItemService) { }

  ngOnInit(): void {
    // this.loadRecommendations(); // Load recommendations on init
    // For now, populate with dummy data or leave empty until service is implemented
    console.log('RecommendedItemsComponent initialized. Placeholder loading commented out.');
  }

  loadRecommendations(): void {
    this.isLoading = true;
    this.errorLoading = false;
    this.recommendedItems = [];

    console.log('Loading recommendations (excluding item ID: ', this.currentItemId, ', category ID: ', this.categoryId, ')');
    
    // Placeholder: Replace with actual recommendation fetching logic
    // Assuming ItemService will have a method like getRecommendations(currentItemId, categoryId, limit)
    /* 
    this.itemService.getRecommendations(this.currentItemId, this.categoryId, this.limit).subscribe({ 
      next: (items: BasicItem[]) => { // Explicit type
        this.recommendedItems = items;
        this.isLoading = false;
      },
      error: (err: any) => { // Explicit type
        console.error('Error loading recommended items:', err);
        this.isLoading = false;
        this.errorLoading = true;
      }
    });
    */
   // Simulate loading finished for now
   setTimeout(() => { 
       this.isLoading = false;
       // Add dummy data here if needed for testing UI
       // this.recommendedItems = [...]; 
       console.warn('Using placeholder logic for recommendations.');
    }, 500); 
  }
} 