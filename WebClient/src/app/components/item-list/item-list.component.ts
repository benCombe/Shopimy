import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Item } from '../../models/item';
import { ItemCardComponent } from '../item-card/item-card.component';
import { BasicItem } from '../../models/basic-item';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ItemCardComponent],
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent implements OnInit {
  @Input() items: BasicItem[] = [];
  @Input() categoryId?: string;
  isLoading = false;

  constructor() {}

  ngOnInit(): void {
    // If needed, fetch items here if categoryId is provided and items array is empty
    if (this.categoryId && (!this.items || this.items.length === 0)) {
      this.loadItems();
    }
  }

  private loadItems(): void {
    // Example loading implementation
    this.isLoading = true;
    
    // Sample timeout to simulate loading - replace with actual service call
    setTimeout(() => {
      // This would be replaced with actual item loading logic
      this.isLoading = false;
    }, 1000);
    
    // Actual implementation would look like:
    /*
    this.itemService.getItemsByCategory(this.categoryId).subscribe(
      (data) => {
        this.items = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading items:', error);
        this.isLoading = false;
      }
    );
    */
  }
}
