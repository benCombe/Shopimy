import { Component, OnInit, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { NgFor, NgIf } from '@angular/common';
import { Item } from '../../../models/item';

let ORD_DATA: Item[] = [];
let ITEM_DATA: Item[] = [];

@Component({
  selector: 'app-orders',
  imports: [NgFor, NgIf, MatTableModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})

export class OrdersComponent implements OnInit {
  @Input() orderData = ORD_DATA; // Data for Order table
  @Input() productData = ITEM_DATA; // Data for Item table

  orderColumns: string[] = ['totalSales', 'orders', 'customers', 'fulfilledOrders'];
  itemColumns: string[] = ['order', 'customer', 'total', 'items', 'payment', 'fulfilled'];

  constructor() { }

  ngOnInit(): void { }
}