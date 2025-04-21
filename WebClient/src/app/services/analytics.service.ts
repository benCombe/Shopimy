import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interface for store visit data
export interface VisitAnalytics {
  labels: string[];
  data: number[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/api/analytics`;

  constructor(private http: HttpClient) { }

  /**
   * Get store visit analytics data
   * @param period The time period for grouping ('daily' or 'monthly')
   * @param range The number of periods to include (e.g., 7 days, 6 months)
   * @returns Observable of visit analytics data with labels and data points
   */
  getStoreVisits(period: string = 'daily', range: number = 7): Observable<VisitAnalytics> {
    // Set up query parameters
    let params = new HttpParams()
      .set('period', period)
      .set('range', range.toString());

    // Make authenticated GET request to the analytics endpoint
    return this.http.get<VisitAnalytics>(`${this.apiUrl}/store-visits`, { params });
  }
}
