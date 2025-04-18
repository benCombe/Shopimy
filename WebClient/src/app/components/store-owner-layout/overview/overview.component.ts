import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PromotionsComponent } from "../promotions/promotions.component";
import { Item } from '../../../models/item';
import { MatTableModule } from '@angular/material/table';
import { NgFor } from '@angular/common';

let ITEM_DATA: Item[] = [];

@Component({
  selector: 'app-overview',
  imports: [
    NgFor, MatTableModule
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {
    @Input() productData = ITEM_DATA; // = Data for Product table
    @Input() visitorData: { day: string, count: number }[] = [];
    @Output() navigateToPage = new EventEmitter<string>();

    displayedColumns: string[] = ['Id', 'Name', 'OriginalPrice', 'QuantityInStock', 'CategoryIds'];

    // Calculate the maximum value for scaling
    get maxVisitorCount(): number {
      return Math.max(...this.visitorData.map(item => item.count));
    }
    
    // Calculate bar height as percentage of the maximum
    getBarHeight(count: number): string {
      return (count / this.maxVisitorCount * 100) + '%';
    }

    // Generate points for the line graph
    getPoints() {
      const points = [];
      const graphWidth = 700;
      const graphHeight = 410; // Adjusted to account for the increased container height
      const padding = 20;
      const availableWidth = graphWidth - (padding * 2);
      const availableHeight = graphHeight - (padding * 2);
      
      const segmentWidth = availableWidth / (this.visitorData.length - 1);
      
      for (let i = 0; i < this.visitorData.length; i++) {
        const x = padding + (i * segmentWidth);
        // Invert Y because SVG coordinates start from top
        const y = graphHeight - padding - (availableHeight * this.visitorData[i].count / this.maxVisitorCount);
        points.push({ x, y });
      }
      
      return points;
    }
    
    // Generate the SVG path for the line
    getLinePath(): string {
      const points = this.getPoints();
      if (points.length === 0) return '';
      
      let path = `M${points[0].x},${points[0].y}`;
      
      for (let i = 1; i < points.length; i++) {
        path += ` L${points[i].x},${points[i].y}`;
      }
      
      return path;
    }

    // Method to navigate to themes page
    navigateToThemes(): void {
      this.navigateToPage.emit('Themes & Logos');
    }

    // Method to navigate to products page
    navigateToProducts(): void {
      this.navigateToPage.emit('Products');
    }

    // Method to navigate to promotions page
    navigateToPromotions(): void {
      this.navigateToPage.emit('Promotions');
    }
    
    // Method to navigate to settings page
    navigateToSettings(): void {
      this.navigateToPage.emit('Settings');
    }
}
