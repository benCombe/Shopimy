import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';

interface MonthlySales {
  month: string;
  amount: number;
}

interface CategorySales {
  category: string;
  percentage: number;
  color: string;
}

interface SalesData {
  orderId: string;
  date: string;
  customer: string;
  items: number;
  amount: string;
  status: string;
}

interface ProductData {
  rank: number;
  product: string;
  category: string;
  unitsSold: number;
  revenue: string;
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule, 
    CurrencyPipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent implements OnInit, AfterViewInit {
  // Summary metrics as inputs
  @Input() totalSales: number = 0;
  @Input() totalOrders: number = 0;
  @Input() averageOrderValue: number = 0;
  @Input() conversionRate: number = 0;
  
  // Bar chart data
  @Input() monthlySalesData: MonthlySales[] = [];

  // Pie chart data
  @Input() categorySalesData: CategorySales[] = [];
  
  // Table data as inputs
  @Input() salesTableData: SalesData[] = [];
  @Input() productsTableData: ProductData[] = [];
  
  // Table configurations
  salesDisplayColumns: string[] = ['orderId', 'date', 'customer', 'items', 'amount', 'status'];
  productsDisplayColumns: string[] = ['rank', 'product', 'category', 'unitsSold', 'revenue'];
  
  salesTableDataSource = new MatTableDataSource<SalesData>([]);
  productsTableDataSource = new MatTableDataSource<ProductData>([]);

  @ViewChild('salesPaginator') salesPaginator!: MatPaginator;
  @ViewChild('productsPaginator') productsPaginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor() { }
  
  ngOnInit(): void {
    // Initialize table data sources with the input data
    this.salesTableDataSource.data = this.salesTableData;
    this.productsTableDataSource.data = this.productsTableData;
  }
  
  ngAfterViewInit() {
    // Set up pagination
    this.salesTableDataSource.paginator = this.salesPaginator;
    this.productsTableDataSource.paginator = this.productsPaginator;
    
    // Set up sorting
    this.salesTableDataSource.sort = this.sort;
    this.productsTableDataSource.sort = this.sort;
  }
  
  // Helper methods for charts
  getBarHeight(value: number): number {
    const maxValue = Math.max(...this.monthlySalesData.map(d => d.amount));
    return (value / maxValue) * 100;
  }
  
  getPieSliceStart(index: number): string {
    let start = 0;
    for (let i = 0; i < index; i++) {
      start += this.categorySalesData[i].percentage;
    }
    return (start * 3.6) + 'deg'; // convert percentage to degrees (360 / 100 = 3.6)
  }
  
  getPieSliceEnd(index: number): string {
    let end = 0;
    for (let i = 0; i <= index; i++) {
      end += this.categorySalesData[i].percentage;
    }
    return (end * 3.6) + 'deg';
  }
  
  getPieSliceSize(index: number): string {
    return (this.categorySalesData[index].percentage * 3.6) + 'deg';
  }
}
