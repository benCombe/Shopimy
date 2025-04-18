import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface RecentPurchase {
  item: string;
  amount: number;
  date: Date;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {
  @Output() pageNavigate = new EventEmitter<string>();

  // Properties for recent purchases
  recentPurchases: RecentPurchase[] = [
    { item: 'Sample Product 1', amount: 29.99, date: new Date() },
    { item: 'Sample Product 2', amount: 49.99, date: new Date() },
    { item: 'Sample Product 3', amount: 19.99, date: new Date() }
  ];

  // Store analytics properties
  storeVisitsImageUrl: string = 'assets/images/analytics-placeholder.png';
  totalVisits: number = 0;
  totalRevenue: number = 0;

  constructor() {
    // Initialize analytics data (in a real app, this would come from a service)
    this.totalVisits = 1234;
    this.totalRevenue = 5678.90;
  }

  navigateTo(page: string): void {
    // Emit the page name to be handled by the parent component
    this.pageNavigate.emit(page);
  }
}
