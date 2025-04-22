import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, switchMap } from 'rxjs';
import { Order } from '../models/order.model';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/api/orders`;

  constructor(
    private http: HttpClient, 
    private cookieService: CookieService,
    private storeService: StoreService
  ) { }

  /**
   * Gets all orders for the current store owner
   */
  getOrders(): Observable<Order[]> {
    // First ensure we have loaded the store
    return this.storeService.getCurrentUserStore().pipe(
      switchMap(() => {
        const token = this.cookieService.get('auth_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
        return this.http.get<Order[]>(this.apiUrl, { headers });
      }),
      catchError(error => {
        console.error('Error fetching orders:', error);
        return of([]);
      })
    );
  }

  /**
   * Gets a specific order by ID
   */
  getOrderById(id: number): Observable<Order | undefined> {
    // First ensure we have loaded the store
    return this.storeService.getCurrentUserStore().pipe(
      switchMap(() => {
        const token = this.cookieService.get('auth_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
        return this.http.get<Order>(`${this.apiUrl}/${id}`, { headers });
      }),
      catchError(error => {
        console.error(`Error fetching order ${id}:`, error);
        return of(undefined);
      })
    );
  }

  /**
   * Updates the status of an order
   */
  updateOrderStatus(orderId: number, status: string): Observable<any> {
    // First ensure we have loaded the store
    return this.storeService.getCurrentUserStore().pipe(
      switchMap(() => {
        const token = this.cookieService.get('auth_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
        return this.http.patch(`${this.apiUrl}/${orderId}`, { status }, { headers });
      }),
      catchError(error => {
        console.error(`Error updating order ${orderId} status:`, error);
        return of({ success: false, message: 'Failed to update status' });
      })
    );
  }
} 