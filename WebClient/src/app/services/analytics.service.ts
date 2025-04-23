import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';

// Interface for store visit data
export interface VisitAnalytics {
  labels: string[];
  data: number[];
}

// Interface for sales data
export interface SalesAnalytics {
  labels: string[];
  revenue: number[];
  orderCount: number[];
  averageOrderValue: number[];
}

// Interface for top products
export interface TopProduct {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface TopProductsAnalytics {
  topProducts: TopProduct[];
}

// Interface for KPIs
export interface KPIAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalVisits: number;
  conversionRate: number;
  productCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/api/analytics`;

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  // Helper to build authorization headers
  private getAuthHeaders(): HttpHeaders {
    const token = this.cookieService.get('auth_token');
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  /**
   * Get store visit analytics data
   * @param period The time period for grouping ('daily', 'monthly', or 'yearly')
   * @param range The number of periods to include (e.g., 7 days, 6 months)
   * @returns Observable of visit analytics data with labels and data points
   */
  getStoreVisits(period: string = 'daily', range: number = 7): Observable<VisitAnalytics> {
    // Set up query parameters
    let params = new HttpParams()
      .set('period', period)
      .set('range', range.toString());

    // Make authenticated GET request to the analytics endpoint
    const headers = this.getAuthHeaders();
    return this.http.get<VisitAnalytics>(`${this.apiUrl}/store-visits`, { params, headers });
  }

  /**
   * Get sales data analytics
   * @param period The time period for grouping ('daily', 'monthly', or 'yearly')
   * @param range The number of periods to include (e.g., 30 days, 12 months)
   * @returns Observable of sales analytics data with labels and multiple data series
   */
  getSalesData(period: string = 'daily', range: number = 30): Observable<SalesAnalytics> {
    // Set up query parameters
    let params = new HttpParams()
      .set('period', period)
      .set('range', range.toString());

    // Make authenticated GET request to the analytics endpoint
    const headers = this.getAuthHeaders();
    return this.http.get<SalesAnalytics>(`${this.apiUrl}/sales-data`, { params, headers });
  }

  /**
   * Get top selling products
   * @param limit The number of top products to retrieve (default: 10)
   * @param startDate Optional start date for the data range
   * @param endDate Optional end date for the data range
   * @returns Observable of top products data
   */
  getTopProducts(
    limit: number = 10, 
    startDate?: Date, 
    endDate?: Date
  ): Observable<TopProductsAnalytics> {
    // Set up query parameters
    let params = new HttpParams().set('limit', limit.toString());
    
    // Add date params if provided
    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    // Make authenticated GET request to the analytics endpoint
    const headers = this.getAuthHeaders();
    return this.http.get<TopProductsAnalytics>(`${this.apiUrl}/top-products`, { params, headers });
  }

  /**
   * Get key performance indicators
   * @returns Observable of KPI data
   */
  getKPIs(): Observable<KPIAnalytics> {
    // Make authenticated GET request to the analytics endpoint
    const headers = this.getAuthHeaders();
    return this.http.get<KPIAnalytics>(`${this.apiUrl}/kpis`, { headers });
  }
}
