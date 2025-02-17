import { Component, OnInit } from '@angular/core';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html'
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];

  ngOnInit(): void {
    // Example of how you might instantiate an item:
    this.items = [
      new Item({
        Name: 'Joni Sweater (digital pattern)',
        Id: 'sweater001',
        OriginalPrice: 12.50,
        SalePrice: 8.50,
        OnSale: true,
        Description: 'An intermediate knitting pattern...',
        QuantityInStock: 100,
        AvailFrom: '2025-02-01',
        AvailTo: '2025-12-31',
        CurrentRating: 4.5,
        CategoryIds: [101, 102]
      }),
      // More items...
    ];
  }
}
