import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Item } from '../../models/item';
import { ItemCardComponent } from '../item-card/item-card.component';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ItemCardComponent],
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];

  ngOnInit(): void {
    // Replace this with an API call via ItemService when ready.
    this.items = [
      new Item({
        Name: 'Joni Sweater (digital pattern)',
        Id: 123,
        OriginalPrice: 12.50,
        SalePrice: 8.50,
        OnSale: true,
        Description: 'An intermediate knitting pattern...',
        QuantityInStock: 100,
        AvailFrom: '2025-02-01',
        AvailTo: '2025-12-31',
        CurrentRating: 4.5,
        CategoryIds: [101, 102],
        ImageUrl: 'assets/images/default.png'
      })
    ];
  }
}
