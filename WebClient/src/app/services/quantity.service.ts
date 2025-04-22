import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interface for store visit data
export interface VisitAnalytics {
  name: string;
  totalQuantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuantityService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) { }

  /**
   * Get store visit analytics data
   * @param period The time period for grouping ('daily' or 'monthly')
   * @param range The number of periods to include (e.g., 7 days, 6 months)
   * @returns Observable of visit analytics data with labels and data points
   */
  getItems(): Observable<VisitAnalytics[]> {
    // Set up query parameters
    let params = new HttpParams()
      .set('storeid', 5);

    // Make authenticated GET request to the analytics endpoint
    console.log("weat");
    return this.http.get<VisitAnalytics[]>(`${this.apiUrl}/item-quantity`, { params });
  }
}
