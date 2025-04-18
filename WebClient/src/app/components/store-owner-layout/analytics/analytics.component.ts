import { Component, Input, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

interface AnalyticsData {
  order: string;
  customer: string;
  total: string;
  items: string;
  payment: string;
  fulfilled: string;
}

interface ChartDataPoint {
  day: string;
  visitors: number;
}

interface SalesDataPoint {
  label: string;
  amount: number;
}

@Component({
  selector: 'app-analytics',
  imports: [NgFor, MatTableModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit {
  @Input() analyticDataSource1: AnalyticsData[] = []; // Data for Recent Purchase table
  @Input() analyticDataSource2: AnalyticsData[] = []; // Data for Popular Items table
  @Input() visitData: ChartDataPoint[] = [];          // Store visits data
  @Input() annualSalesData: SalesDataPoint[] = [];    // Annual sales data
  @Input() currentMonthData: SalesDataPoint[] = [];   // Current month sales data
  @Input() previousMonthData: SalesDataPoint[] = [];  // Previous month sales data
  
  displayedColumns: string[] = ['order', 'customer', 'total', 'items', 'payment', 'fulfilled'];
  
  // Chart data points (calculated from input data)
  visitChartPoints: string = '';
  maxVisitors: number = 0;
  maxAnnualSales: number = 0;
  currentMonthPoints: string = '';
  previousMonthPoints: string = '';
  maxMonthlySales: number = 0;

  // Modified margins to better fit the extended chart
  chartMargins = { top: 15, right: 25, bottom: 25, left: 30 };
  
  // Updated chart width for even wider x-axis
  chartWidth = 180; // Increased from 140 to match wider viewBox
  chartHeight = 100;
  
  ngOnInit() {
    // Process the input data to generate chart points
    this.processChartData();
  }

  // Process all chart data from inputs
  processChartData() {
    // Process store visits data
    if (this.visitData.length > 0) {
      this.generateStoreVisitsPoints();
    }
    
    // Process annual sales data
    if (this.annualSalesData.length > 0) {
      this.maxAnnualSales = Math.max(...this.annualSalesData.map(d => d.amount));
    }
    
    // Process monthly sales data
    if (this.currentMonthData.length > 0 && this.previousMonthData.length > 0) {
      this.generateMonthlySalesPoints();
    }
  }

  generateStoreVisitsPoints() {
    // Find maximum visitors for scaling
    this.maxVisitors = Math.max(...this.visitData.map(d => d.visitors));
    
    // Account for margins in the usable chart area
    const usableWidth = this.chartWidth - this.chartMargins.left - this.chartMargins.right;
    const usableHeight = this.chartHeight - this.chartMargins.top - this.chartMargins.bottom;
    
    // Generate points for SVG polyline - adjusted to account for margins
    this.visitChartPoints = this.visitData.map((data, index) => {
      const x = this.chartMargins.left + (index * (usableWidth / (this.visitData.length - 1)));
      const y = this.chartMargins.top + (usableHeight - (data.visitors / this.maxVisitors) * usableHeight);
      return `${x},${y}`;
    }).join(' ');
  }
  
  // Generate monthly sales comparison points
  generateMonthlySalesPoints() {
    // Find maximum value for scaling
    this.maxMonthlySales = Math.max(
      ...this.currentMonthData.map(d => d.amount),
      ...this.previousMonthData.map(d => d.amount)
    );
    
    // Generate line chart points for current month
    const usableWidth = this.chartWidth - this.chartMargins.left - this.chartMargins.right;
    const usableHeight = this.chartHeight - this.chartMargins.top - this.chartMargins.bottom;
    
    this.currentMonthPoints = this.currentMonthData.map((data, index) => {
      const x = this.chartMargins.left + (index * (usableWidth / (this.currentMonthData.length - 1)));
      const y = this.chartMargins.top + (usableHeight - (data.amount / this.maxMonthlySales) * usableHeight);
      return `${x},${y}`;
    }).join(' ');
    
    // Generate line chart points for previous month
    this.previousMonthPoints = this.previousMonthData.map((data, index) => {
      const x = this.chartMargins.left + (index * (usableWidth / (this.previousMonthData.length - 1)));
      const y = this.chartMargins.top + (usableHeight - (data.amount / this.maxMonthlySales) * usableHeight);
      return `${x},${y}`;
    }).join(' ');
  }
  
  // Helper method to get y-axis tick values
  getYAxisTicks(): number[] {
    const tickCount = 5;
    const ticks: number[] = [];
    for (let i = 0; i <= tickCount; i++) {
      ticks.push(Math.round(this.maxVisitors * (i / tickCount)));
    }
    return ticks;
  }

  // Calculate X position for data points
  getXPosition(index: number): number {
    const usableWidth = this.chartWidth - this.chartMargins.left - this.chartMargins.right;
    return this.chartMargins.left + (index * (usableWidth / (this.visitData.length - 1)));
  }
  
  // Calculate Y position for data points
  getYPosition(visitors: number): number {
    const usableHeight = this.chartHeight - this.chartMargins.top - this.chartMargins.bottom;
    return this.chartMargins.top + (usableHeight - (visitors / this.maxVisitors) * usableHeight);
  }
  
  // Get Y position for grid lines - adjusted to improve alignment
  getGridLineY(index: number, totalTicks: number): number {
    const usableHeight = this.chartHeight - this.chartMargins.top - this.chartMargins.bottom;
    return this.chartMargins.top + (usableHeight - (index * usableHeight / totalTicks));
  }

  // Get bar width for annual sales chart
  getBarWidth(): number {
    const usableWidth = this.chartWidth - this.chartMargins.left - this.chartMargins.right;
    return (usableWidth / this.annualSalesData.length) * 0.7; // 70% of available space per bar
  }
  
  // Get bar X position
  getBarX(index: number): number {
    const usableWidth = this.chartWidth - this.chartMargins.left - this.chartMargins.right;
    const barWidth = this.getBarWidth();
    const barSpacing = usableWidth / this.annualSalesData.length;
    return this.chartMargins.left + (barSpacing * index) + (barSpacing - barWidth) / 2;
  }
  
  // Get bar height
  getBarHeight(amount: number): number {
    const usableHeight = this.chartHeight - this.chartMargins.top - this.chartMargins.bottom;
    return (amount / this.maxAnnualSales) * usableHeight;
  }
  
  // Get bar Y position
  getBarY(amount: number): number {
    const usableHeight = this.chartHeight - this.chartMargins.top - this.chartMargins.bottom;
    return this.chartHeight - this.chartMargins.bottom - (amount / this.maxAnnualSales) * usableHeight;
  }
  
  // Get Y-axis ticks for annual sales
  getAnnualSalesTicks(): number[] {
    const tickCount = 5;
    const ticks: number[] = [];
    for (let i = 0; i <= tickCount; i++) {
      ticks.push(Math.round(this.maxAnnualSales * (i / tickCount)));
    }
    return ticks;
  }
  
  // Get Y-axis ticks for monthly sales
  getMonthlySalesTicks(): number[] {
    const tickCount = 5;
    const ticks: number[] = [];
    for (let i = 0; i <= tickCount; i++) {
      ticks.push(Math.round(this.maxMonthlySales * (i / tickCount)));
    }
    return ticks;
  }
  
  // Calculate X position for monthly data points
  getMonthlyXPosition(index: number): number {
    const usableWidth = this.chartWidth - this.chartMargins.left - this.chartMargins.right;
    return this.chartMargins.left + (index * (usableWidth / (this.currentMonthData.length - 1)));
  }
  
  // Format currency value with K/M suffixes
  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else {
      return `$${value}`;
    }
  }
}
