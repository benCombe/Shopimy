import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { AnalyticsService, KPIAnalytics, SalesAnalytics, TopProductsAnalytics, VisitAnalytics } from '../../../services/analytics.service';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  // Data holders
  kpiData: KPIAnalytics | null = null;
  salesData: SalesAnalytics | null = null;
  visitData: VisitAnalytics | null = null;
  topProductsData: TopProductsAnalytics | null = null;

  // Chart instances
  salesChart: Chart | null = null;
  visitsChart: Chart | null = null;
  topProductsChart: Chart | null = null;

  // Filter options
  salesPeriod = 'monthly';
  salesRange = 12;
  visitsPeriod = 'daily';
  visitsRange = 30;
  
  // Loading states
  isLoadingKPIs = false;
  isLoadingSales = false;
  isLoadingVisits = false;
  isLoadingTopProducts = false;
  
  // Error states
  kpiError: string | null = null;
  salesError: string | null = null;
  visitsError: string | null = null;
  topProductsError: string | null = null;

  // Subscriptions
  private subscriptions: Subscription = new Subscription();

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized once data is loaded
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions and charts
    this.subscriptions.unsubscribe();
    this.destroyCharts();
  }

  loadAllData(): void {
    this.loadKPIs();
    this.loadSalesData();
    this.loadVisitsData();
    this.loadTopProducts();
  }

  loadKPIs(): void {
    this.isLoadingKPIs = true;
    this.kpiError = null;

    const sub = this.analyticsService.getKPIs()
      .pipe(
        catchError(err => {
          console.error('Error loading KPIs:', err);
          this.kpiError = 'Failed to load KPIs. Please try again later.';
          return of(null);
        })
      )
      .subscribe(data => {
        this.kpiData = data;
        this.isLoadingKPIs = false;
      });

    this.subscriptions.add(sub);
  }

  loadSalesData(): void {
    this.isLoadingSales = true;
    this.salesError = null;

    const sub = this.analyticsService.getSalesData(this.salesPeriod, this.salesRange)
      .pipe(
        catchError(err => {
          console.error('Error loading sales data:', err);
          this.salesError = 'Failed to load sales data. Please try again later.';
          return of(null);
        })
      )
      .subscribe(data => {
        this.salesData = data;
        this.isLoadingSales = false;
        if (data) {
          this.initSalesChart();
        }
      });

    this.subscriptions.add(sub);
  }

  loadVisitsData(): void {
    this.isLoadingVisits = true;
    this.visitsError = null;

    const sub = this.analyticsService.getStoreVisits(this.visitsPeriod, this.visitsRange)
      .pipe(
        catchError(err => {
          console.error('Error loading visit data:', err);
          this.visitsError = 'Failed to load visit data. Please try again later.';
          return of(null);
        })
      )
      .subscribe(data => {
        this.visitData = data;
        this.isLoadingVisits = false;
        if (data) {
          this.initVisitsChart();
        }
      });

    this.subscriptions.add(sub);
  }

  loadTopProducts(): void {
    this.isLoadingTopProducts = true;
    this.topProductsError = null;

    const sub = this.analyticsService.getTopProducts(10)
      .pipe(
        catchError(err => {
          console.error('Error loading top products:', err);
          this.topProductsError = 'Failed to load top products. Please try again later.';
          return of(null);
        })
      )
      .subscribe(data => {
        this.topProductsData = data;
        this.isLoadingTopProducts = false;
        if (data) {
          this.initTopProductsChart();
        }
      });

    this.subscriptions.add(sub);
  }

  onSalesFilterChange(): void {
    // Destroy existing chart to prevent memory leaks
    if (this.salesChart) {
      this.salesChart.destroy();
      this.salesChart = null;
    }
    
    // Reload data with new filter
    this.loadSalesData();
  }

  onVisitsFilterChange(): void {
    // Destroy existing chart to prevent memory leaks
    if (this.visitsChart) {
      this.visitsChart.destroy();
      this.visitsChart = null;
    }
    
    // Reload data with new filter
    this.loadVisitsData();
  }

  initSalesChart(): void {
    if (!this.salesData) return;

    // Destroy existing chart to prevent memory leaks
    if (this.salesChart) {
      this.salesChart.destroy();
    }

    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!ctx) return; // Skip if the canvas element doesn't exist yet

    this.salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.salesData.labels,
        datasets: [
          {
            label: 'Revenue',
            data: this.salesData.revenue,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            tension: 0.1,
            yAxisID: 'y'
          },
          {
            label: 'Orders',
            data: this.salesData.orderCount,
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderWidth: 2,
            tension: 0.1,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Revenue ($)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'Orders'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Sales Trends'
          }
        }
      }
    });
  }

  initVisitsChart(): void {
    if (!this.visitData) return;

    // Destroy existing chart to prevent memory leaks
    if (this.visitsChart) {
      this.visitsChart.destroy();
    }

    const ctx = document.getElementById('visitsChart') as HTMLCanvasElement;
    if (!ctx) return; // Skip if the canvas element doesn't exist yet

    this.visitsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.visitData.labels,
        datasets: [
          {
            label: 'Store Visits',
            data: this.visitData.data,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 2,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Visits'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Store Traffic'
          }
        }
      }
    });
  }

  initTopProductsChart(): void {
    if (!this.topProductsData?.topProducts?.length) return;

    // Destroy existing chart to prevent memory leaks
    if (this.topProductsChart) {
      this.topProductsChart.destroy();
    }

    const ctx = document.getElementById('topProductsChart') as HTMLCanvasElement;
    if (!ctx) return; // Skip if the canvas element doesn't exist yet

    // Prepare data for chart
    const productNames = this.topProductsData.topProducts.map(p => p.productName);
    const productRevenue = this.topProductsData.topProducts.map(p => p.revenue);
    const productQuantity = this.topProductsData.topProducts.map(p => p.quantitySold);

    this.topProductsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: productNames,
        datasets: [
          {
            label: 'Revenue',
            data: productRevenue,
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Quantity Sold',
            data: productQuantity,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          y: {
            type: 'category',
            position: 'left',
            title: {
              display: true,
              text: 'Product'
            }
          },
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Revenue ($)'
            }
          },
          y1: {
            type: 'linear',
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'Quantity Sold'
            }
          }
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Top Selling Products'
          }
        }
      }
    });
  }

  destroyCharts(): void {
    if (this.salesChart) {
      this.salesChart.destroy();
      this.salesChart = null;
    }
    
    if (this.visitsChart) {
      this.visitsChart.destroy();
      this.visitsChart = null;
    }
    
    if (this.topProductsChart) {
      this.topProductsChart.destroy();
      this.topProductsChart = null;
    }
  }

  // Formatters for display
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  formatPercent(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }
}
