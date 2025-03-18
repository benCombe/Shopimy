import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-orders',
  imports: [],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  totalOrdersColumns: string[] = ['totalSales', 'orders', 'customers', 'fulfilledOrders'];
  orderDetailsColumns: string[] = ['order', 'customer', 'total', 'items', 'payment', 'fulfilled'];
  
  totalOrdersDataSource = new MatTableDataSource([
    { totalSales: '$1500', orders: 16, customers: 5, fulfilledOrders: 1 }
        // ... add other rows here

  ]);

  orderDetailsDataSource = new MatTableDataSource([
    { order: '123456', customer: 'First Last', total: 50, items: 1, payment: 'Paid', fulfilled: 'Fulfilled' },
    // ... add other rows here
  ]);

  constructor() { }

  ngOnInit(): void { }
}