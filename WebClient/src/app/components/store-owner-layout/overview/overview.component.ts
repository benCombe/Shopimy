import { Component, EventEmitter, Output, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { AnalyticsService, VisitAnalytics } from '../../../services/analytics.service';
import { Order } from '../../../models/order.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit, AfterViewInit {
  @Output() pageNavigate = new EventEmitter<string>();
  @ViewChild('visitsChart') visitsChartCanvas!: ElementRef;

  // Properties for recent orders
  recentOrders: Order[] = [];
  isLoading = true;
  error: string | null = null;

  // Analytics properties
  totalVisits: number = 0;
  totalRevenue: number = 0;
  
  // Chart properties
  visitsChart: Chart | null = null;
  visitChartLoading = true;
  visitChartError: string | null = null;
  visitLabels: string[] = [];
  visitData: number[] = [];

  constructor(
    private orderService: OrderService,
    private analyticsService: AnalyticsService
  ) {
    // Initialize analytics data (real data will be fetched)
    this.totalRevenue = 0;
  }

  ngOnInit(): void {
    this.loadRecentOrders();
    this.loadVisitData();
  }

  ngAfterViewInit(): void {
    this.initVisitsChart();
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

  loadVisitData(): void {
    this.visitChartLoading = true;
    this.visitChartError = null;

    this.analyticsService.getStoreVisits('daily', 7).subscribe({
      next: (data: VisitAnalytics) => {
        this.visitLabels = data.labels;
        this.visitData = data.data;
        this.totalVisits = this.visitData.reduce((sum, current) => sum + current, 0);
        this.visitChartLoading = false;
        this.updateVisitsChart();
      },
      error: (err) => {
        console.error('Error fetching visit data:', err);
        this.visitChartError = 'Failed to load visit data. Please try again later.';
        this.visitChartLoading = false;
        // Initialize chart with empty data anyway
        this.updateVisitsChart();
      }
    });
  }

  initVisitsChart(): void {
    if (this.visitsChartCanvas) {
      const ctx = this.visitsChartCanvas.nativeElement.getContext('2d');
      this.visitsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.visitLabels,
          datasets: [{
            label: 'Store Visits',
            data: this.visitData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0 // Only show whole numbers
              }
            }
          }
        }
      });
    }
  }

  updateVisitsChart(): void {
    if (this.visitsChart) {
      this.visitsChart.data.labels = this.visitLabels;
      this.visitsChart.data.datasets[0].data = this.visitData;
      this.visitsChart.update();
    }
  }

  navigateTo(page: string): void {
    // Emit the page name to be handled by the parent component
    this.pageNavigate.emit(page);
  }

  retryLoadVisitData(): void {
    this.loadVisitData();
  }
}
