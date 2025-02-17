import { Component, Input } from '@angular/core';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.scss']
})
export class ItemCardComponent {
  @Input() item: Item;

  addToBasket(item: Item) {
    console.log('Adding to basket:', item);
    // Integrate with your basket service or emit an event
  }

  bookmarkItem(item: Item) {
    console.log('Bookmarking item:', item);
    // Integrate with your bookmark/favorite service or emit an event
  }
}
