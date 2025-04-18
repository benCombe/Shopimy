import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  
  // Stats
  totalSales: number = 0;
  totalOrders: number = 0;
  uniqueCustomers: number = 0;
  completedOrders: number = 0;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = null;
    
    this.orderService.getOrders()
      .pipe(
        catchError(err => {
          console.error('Error fetching orders:', err);
          this.error = 'Failed to load orders. Please try again later.';
          return of([] as Order[]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(orders => {
        this.orders = orders;
        this.calculateOrderStats();
      });
  }

  calculateOrderStats(): void {
    if (!this.orders || this.orders.length === 0) {
      this.totalSales = 0;
      this.totalOrders = 0;
      this.uniqueCustomers = 0;
      this.completedOrders = 0;
      return;
    }

    // Calculate total sales
    this.totalSales = this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Total orders
    this.totalOrders = this.orders.length;
    
    // Count unique customers (by name)
    const uniqueCustomerNames = new Set<string>();
    this.orders.forEach(order => uniqueCustomerNames.add(order.customerName));
    this.uniqueCustomers = uniqueCustomerNames.size;
    
    // Count completed orders (delivered or shipped)
    this.completedOrders = this.orders.filter(
      order => order.status === 'Delivered' || order.status === 'Shipped'
    ).length;
  }

  // Helper method to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  
  // Helper method to get badge class based on status
  getStatusBadgeClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'processing') return 'status-processing';
    if (statusLower === 'shipped') return 'status-shipped';
    if (statusLower === 'delivered') return 'status-delivered';
    if (statusLower === 'cancelled') return 'status-cancelled';
    return '';
  }
}
