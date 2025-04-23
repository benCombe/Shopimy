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
  
  // Visit metrics
  visitsChange: number | null = null;
  visitsChangePercentage: string = '0';
  averageDailyVisits: number | null = null;
  
  // Time range selection
  selectedTimeRange: string = 'weekly';
  
  // Chart properties
  visitsChart: Chart | null = null;
  visitChartLoading = true;
  visitChartError: string | null = null;
  visitLabels: string[] = [];
  visitData: number[] = [];
  previousPeriodData: number[] = [];
  chartInitialized = false;

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

  changeTimeRange(range: string): void {
    this.selectedTimeRange = range;
    
    // Determine range and period based on selected time range
    let period = 'daily';
    let daysRange = 7;
    
    if (range === 'weekly') {
      period = 'daily';
      daysRange = 7;
    } else if (range === 'monthly') {
      period = 'daily';
      daysRange = 30;
    }
    
    this.loadVisitData(period, daysRange);
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

  loadVisitData(period: string = 'daily', range: number = 7): void {
    this.visitChartLoading = true;
    this.visitChartError = null;

    // Get current period data
    this.analyticsService.getStoreVisits(period, range).subscribe({
      next: (data: VisitAnalytics) => {
        this.visitLabels = data.labels;
        this.visitData = data.data;
        this.totalVisits = this.calculateTotalVisits(this.visitData);
        
        // Calculate average daily visits
        this.averageDailyVisits = Math.round(this.totalVisits / this.visitData.length);
        
        // Now get previous period data for comparison
        const previousPeriodRange = range * 2; // Fetch enough data to include previous period
        this.analyticsService.getStoreVisits(period, previousPeriodRange).subscribe({
          next: (extendedData: VisitAnalytics) => {
            // Extract previous period data
            if (extendedData.data.length >= range * 2) {
              this.previousPeriodData = extendedData.data.slice(range, range * 2).reverse();
              
              // Calculate change percentage
              const previousTotal = this.calculateTotalVisits(this.previousPeriodData);
              if (previousTotal > 0) {
                this.visitsChange = this.totalVisits - previousTotal;
                const changePercent = (this.visitsChange / previousTotal) * 100;
                this.visitsChangePercentage = changePercent.toFixed(1);
              } else {
                this.visitsChange = this.totalVisits;
                this.visitsChangePercentage = '100';
              }
            }
            
            this.visitChartLoading = false;
            this.updateVisitsChart();
          },
          error: (err) => {
            console.error('Error fetching previous period visit data:', err);
            this.visitChartLoading = false;
            this.updateVisitsChart();
          }
        });
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

  calculateTotalVisits(data: number[]): number {
    return data.reduce((sum, current) => sum + current, 0);
  }

  getBarHeight(value: number): number {
    // Calculate the relative height percentage for the bar
    const maxValue = Math.max(...this.visitData, 1); // Prevent division by zero
    return (value / maxValue) * 90; // Use 90% as the max height to leave room for value display
  }

  initVisitsChart(): void {
    if (this.visitsChartCanvas) {
      try {
        const ctx = this.visitsChartCanvas.nativeElement.getContext('2d');
        if (!ctx) {
          console.error('Failed to get 2D context from canvas');
          this.chartInitialized = false;
          return;
        }
        
        // Define the chart colors from design system
        const mainColor = getComputedStyle(document.documentElement).getPropertyValue('--main-color').trim() || '#393727';
        const secondColor = getComputedStyle(document.documentElement).getPropertyValue('--second-color').trim() || '#D0933D';
        const thirdColor = getComputedStyle(document.documentElement).getPropertyValue('--third-color').trim() || '#D3CEBB';
        const fontFamily = getComputedStyle(document.documentElement).getPropertyValue('--main-font-fam').trim() || '"Inria Serif", serif';
        
        // Register custom tooltip with styled content
        Chart.register({
          id: 'customStyleTooltip',
          beforeTooltipDraw: (chart) => {
            // Add custom styling to tooltip
            const tooltipEl = chart.tooltip?.chart.canvas.parentNode?.querySelector('.chartjs-tooltip');
            if (tooltipEl && tooltipEl instanceof HTMLElement) {
              tooltipEl.style.fontFamily = fontFamily;
              tooltipEl.style.borderRadius = '8px';
              tooltipEl.style.padding = '8px 12px';
              tooltipEl.style.boxShadow = 'var(--shadow-md, 0 4px 8px rgba(0, 0, 0, 0.1))';
            }
          }
        });
        
        this.visitsChart = new Chart(ctx, {
          type: 'bar', // Changed to bar for better visual alignment with the fallback chart
          data: {
            labels: this.visitLabels,
            datasets: [{
              label: 'Store Visits',
              data: this.visitData,
              backgroundColor: `rgba(${this.hexToRgb(secondColor)}, 0.7)`,
              borderColor: secondColor,
              borderWidth: 1,
              borderRadius: 4,
              maxBarThickness: 35,
              minBarLength: 3,
              barPercentage: 0.8, // Controls the width of the bar relative to the category width
              categoryPercentage: 0.7, // Controls the width of the category (affects space between bars)
              hoverBackgroundColor: secondColor,
              hoverBorderColor: mainColor,
              hoverBorderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              title: {
                display: true,
                text: 'Store Visits',
                align: 'start',
                color: mainColor,
                font: {
                  family: fontFamily,
                  size: 16,
                  weight: 'bold'
                },
                padding: {
                  bottom: 10
                }
              },
              subtitle: {
                display: true,
                text: this.selectedTimeRange === 'weekly' ? 'Past 7 days' : 'Past 30 days',
                align: 'end',
                color: `rgba(${this.hexToRgb(mainColor)}, 0.7)`,
                font: {
                  family: fontFamily,
                  size: 12,
                  weight: 'normal'
                },
                padding: {
                  bottom: 20
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: mainColor,
                titleColor: secondColor,
                bodyColor: thirdColor,
                titleFont: {
                  family: fontFamily,
                  size: 14,
                  weight: 'bold'
                },
                bodyFont: {
                  family: fontFamily,
                  size: 12
                },
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                  title: function(tooltipItems) {
                    return tooltipItems[0].label;
                  },
                  label: function(context) {
                    return `Visits: ${context.parsed.y}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: `rgba(${this.hexToRgb(mainColor)}, 0.1)`,
                  drawTicks: false
                },
                border: {
                  display: false
                },
                ticks: {
                  precision: 0, // Only show whole numbers
                  color: mainColor,
                  font: {
                    family: fontFamily,
                    size: 11
                  },
                  padding: 8,
                  callback: function(value) {
                    // Only show integers, hide 0
                    if (value === 0) return '';
                    return value;
                  }
                }
              },
              x: {
                grid: {
                  display: false
                },
                border: {
                  display: false
                },
                ticks: {
                  color: mainColor,
                  font: {
                    family: fontFamily,
                    size: 10
                  },
                  maxRotation: 45,
                  minRotation: 0,
                  padding: 8,
                  autoSkip: true,
                  maxTicksLimit: 10 // Limit the number of ticks displayed
                }
              }
            },
            animation: {
              duration: 1200,
              easing: 'easeOutQuart',
              // Add delay to each bar for a staggered effect
              delay: function(context) {
                return context.dataIndex * 50;
              }
            },
            layout: {
              padding: {
                top: 10,
                right: 25, // Added more right padding
                bottom: 10,
                left: 25  // Added more left padding
              }
            },
            interaction: {
              mode: 'index',
              intersect: false
            },
            hover: {
              mode: 'index',
              intersect: false
            }
          }
        });
        
        this.chartInitialized = true;
      } catch (error) {
        console.error('Error initializing chart:', error);
        this.chartInitialized = false;
      }
    } else {
      console.warn('visitsChartCanvas is not available');
      this.chartInitialized = false;
    }
  }

  updateVisitsChart(): void {
    if (this.visitsChart && this.chartInitialized) {
      try {
        this.visitsChart.data.labels = this.visitLabels;
        this.visitsChart.data.datasets[0].data = this.visitData;
        this.visitsChart.update();
      } catch (error) {
        console.error('Error updating chart:', error);
        this.chartInitialized = false;
      }
    }
  }

  navigateTo(page: string): void {
    // Emit the page name to be handled by the parent component
    this.pageNavigate.emit(page);
  }

  retryLoadVisitData(): void {
    this.loadVisitData();
  }

  // Helper method to convert hex color to RGB format
  hexToRgb(hex: string): string {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Handle shorthand hex format (e.g., #FFF)
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Return as string
    return isNaN(r) || isNaN(g) || isNaN(b) ? '57, 55, 39' : `${r}, ${g}, ${b}`;
  }
}
