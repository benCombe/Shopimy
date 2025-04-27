import { Injectable } from '@angular/core';
import { HttpClient, HttpParams,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';

// Interface for store visit data
export interface VisitAnalytics {
  name: string;
  totalPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class TotalService {
  private apiUrl = `${environment.apiUrl}/api/analytics`;

  constructor(private http: HttpClient,private cookieService: CookieService) { }

  /**
   * Get store visit analytics data
   * @param period The time period for grouping ('daily' or 'monthly')
   * @param range The number of periods to include (e.g., 7 days, 6 months)
   * @returns Observable of visit analytics data with labels and data points
   */
  getItems(): Observable<VisitAnalytics[]> {
    // Set up query parameters
    const params = new HttpParams()
      .set('storeid', 5);
    const token = this.cookieService.get('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`)
    // Make authenticated GET request to the analytics endpoint
    return this.http.get<VisitAnalytics[]>(`${this.apiUrl}/item-total`, { params,headers });
  }
}
