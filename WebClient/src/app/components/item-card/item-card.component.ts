import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../models/item';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.scss'],
  standalone: true,  // Declare as standalone
  imports: [CommonModule, RouterModule]
})
export class ItemCardComponent {
  @Input() item!: Item;
  
  addToBasket(item: Item) {
    console.log('Adding to basket:', item);
    // Your add-to-basket logic here
  }

  bookmarkItem(item: Item) {
    console.log('Bookmarking item:', item);
    // Your bookmark logic here
  }
}
