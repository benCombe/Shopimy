import { Component, Input, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
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
  imports: [NgFor, NgIf, MatTableModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit {
  @Input() analyticDataSource1: AnalyticsData[] = []; // Data for Recent Purchase table
  @Input() analyticDataSource2: AnalyticsData[] = []; // Data for Popular Items table
  
  displayedColumns: string[] = ['order', 'customer', 'total', 'items', 'payment', 'fulfilled'];
  
  // Store visits data
  visitData: ChartDataPoint[] = [];
  visitChartPoints: string = '';
  maxVisitors: number = 0;

  // Annual sales data
  annualSalesData: SalesDataPoint[] = [];
  maxAnnualSales: number = 0;
  
  // Monthly sales data
  currentMonthData: SalesDataPoint[] = [];
  previousMonthData: SalesDataPoint[] = [];
  currentMonthPoints: string = '';
  previousMonthPoints: string = '';
  maxMonthlySales: number = 0;

  // Modified margins to better fit the extended chart
  chartMargins = { top: 15, right: 25, bottom: 25, left: 30 };
  
  // Updated chart width for even wider x-axis
  chartWidth = 180; // Increased from 140 to match wider viewBox
  chartHeight = 100;
  
  ngOnInit() {
    // Sample data for Recent Purchase
    if (this.analyticDataSource1.length === 0) {
      this.analyticDataSource1 = [
        {order: 'ORD001', customer: 'John Doe', total: '$120.99', items: '3', payment: 'Credit Card', fulfilled: 'Yes'},
        {order: 'ORD002', customer: 'Jane Smith', total: '$85.50', items: '2', payment: 'PayPal', fulfilled: 'Yes'},
        {order: 'ORD003', customer: 'Robert Johnson', total: '$210.75', items: '5', payment: 'Credit Card', fulfilled: 'No'},
        {order: 'ORD004', customer: 'Emily Davis', total: '$45.99', items: '1', payment: 'Cash', fulfilled: 'Yes'},
      ];
    }
    
    // Sample data for Popular Items
    if (this.analyticDataSource2.length === 0) {
      this.analyticDataSource2 = [
        {order: 'ITEM001', customer: 'T-Shirt', total: '$29.99', items: '150', payment: '15%', fulfilled: 'Clothing'},
        {order: 'ITEM002', customer: 'Smartphone Case', total: '$15.99', items: '120', payment: '12%', fulfilled: 'Accessories'},
        {order: 'ITEM003', customer: 'Water Bottle', total: '$12.50', items: '100', payment: '10%', fulfilled: 'Lifestyle'},
        {order: 'ITEM004', customer: 'Notebook', total: '$8.99', items: '90', payment: '9%', fulfilled: 'Stationery'},
      ];
    }
    
    // Generate store visits data
    this.generateStoreVisitsData();
    
    // Generate annual sales data
    this.generateAnnualSalesData();
    
    // Generate monthly sales data
    this.generateMonthlySalesData();
  }

  generateStoreVisitsData() {
    // Sample data for the week
    this.visitData = [
      { day: 'Mon', visitors: 65 },
      { day: 'Tue', visitors: 72 },
      { day: 'Wed', visitors: 58 },
      { day: 'Thu', visitors: 80 },
      { day: 'Fri', visitors: 92 },
      { day: 'Sat', visitors: 120 },
      { day: 'Sun', visitors: 85 }
    ];
    
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

  // Generate annual sales data - bar chart
  generateAnnualSalesData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Sample data - sales by month
    this.annualSalesData = months.map(month => {
      return { 
        label: month, 
        amount: Math.floor(Math.random() * 50000) + 30000 
      };
    });
    
    this.maxAnnualSales = Math.max(...this.annualSalesData.map(d => d.amount));
  }
  
  // Generate monthly sales comparison data
  generateMonthlySalesData() {
    // Sample data for current month (first 30 days)
    this.currentMonthData = Array.from({length: 30}, (_, i) => {
      return {
        label: (i + 1).toString(),
        amount: Math.floor(Math.random() * 3000) + 1000
      };
    });
    
    // Sample data for previous month (for comparison)
    this.previousMonthData = Array.from({length: 30}, (_, i) => {
      return {
        label: (i + 1).toString(),
        amount: Math.floor(Math.random() * 2800) + 800
      };
    });
    
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
