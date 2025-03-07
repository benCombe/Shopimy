import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Item } from '../../models/item';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ItemCardComponent implements OnInit {
  @Input() itemId!: number; // Ticket requires itemId as input
  item: Item | null = null;

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    if (this.itemId) {
      this.itemService.getItemById(this.itemId).subscribe((data: Item) => {
        this.item = data;
      });
    }
  }

  addToBasket(item: Item): void {
    console.log('Adding to basket:', item);
    // Implement your basket logic here
  }

  bookmarkItem(item: Item): void {
    console.log('Bookmarking item:', item);
    // Implement your bookmark logic here
  }
}
