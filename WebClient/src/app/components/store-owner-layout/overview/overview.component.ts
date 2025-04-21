import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit {
  @Output() pageNavigate = new EventEmitter<string>();

  // Properties for recent orders
  recentOrders: Order[] = [];
  isLoading = true;
  error: string | null = null;

  // Store analytics properties
  storeVisitsImageUrl: string = 'assets/images/analytics-placeholder.png';
  totalVisits: number = 0;
  totalRevenue: number = 0;

  constructor(private orderService: OrderService) {
    // Initialize analytics data (in a real app, this would come from a service)
    this.totalVisits = 1234;
    this.totalRevenue = 5678.90;
  }

  ngOnInit(): void {
    this.loadRecentOrders();
  }

  loadRecentOrders(): void {
    this.isLoading = true;
    this.error = null;
    
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        // Sort by order date (newest first) and take the 10 most recent
        this.recentOrders = orders
          .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
          .slice(0, 10);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.error = 'Failed to load recent orders. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  navigateTo(page: string): void {
    // Emit the page name to be handled by the parent component
    this.pageNavigate.emit(page);
  }
}
