import { Component, OnInit, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { NgFor } from '@angular/common';
import { Item } from '../../../models/item';

// Interface for order summary data
interface OrderSummary {
  totalSales: string;
  orders: number;
  items: number;
  fulfilledOrders: number;
}

// Interface for detailed order information
interface OrderDetail {
  order: string;
  customer: string;
  total: string;
  items: number;
  payment: string;
  fulfilled: string;
}

@Component({
  selector: 'app-orders',
  imports: [NgFor, MatTableModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})

export class OrdersComponent implements OnInit {
  @Input() orderData: OrderDetail[] = []; // Now expecting data from parent component
  summaryData: OrderSummary[] = []; // Will be calculated dynamically

  orderColumns: string[] = ['totalSales', 'orders', 'items', 'fulfilledOrders'];
  itemColumns: string[] = ['order', 'customer', 'total', 'items', 'payment', 'fulfilled'];

  constructor() { }

  ngOnInit(): void {
    this.calculateSummary();
  }

  calculateSummary(): void {
    // Set initial summary object
    const summary: OrderSummary = {
      totalSales: '$0.00',
      orders: 0,
      items: 0,
      fulfilledOrders: 0
    };

    if (this.orderData.length > 0) {
      // Calculate total sales
      let totalAmount = 0;
      let totalItems = 0;

      this.orderData.forEach(order => {
        // Add to total sales (convert string like '$128.99' to number)
        const amount = parseFloat(order.total.replace('$', '').replace(',', ''));
        if (!isNaN(amount)) {
          totalAmount += amount;
        }

        // Sum up items from all orders
        totalItems += order.items;

        // Count fulfilled orders
        if (order.fulfilled === 'Yes') {
          summary.fulfilledOrders++;
        }
      });

      // Format the total sales
      summary.totalSales = '$' + totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      
      // Set the number of orders
      summary.orders = this.orderData.length;
      
      // Set the total number of items across all orders
      summary.items = totalItems;
    }

    // Update the summaryData array
    this.summaryData = [summary];
  }
}