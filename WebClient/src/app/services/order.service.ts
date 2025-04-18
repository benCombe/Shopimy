import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { Order } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) { }

  /**
   * Gets all orders for the current store owner
   */
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl)
      .pipe(
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
    return this.http.get<Order>(`${this.apiUrl}/${id}`)
      .pipe(
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
    return this.http.patch(`${this.apiUrl}/${orderId}`, { status })
      .pipe(
        catchError(error => {
          console.error(`Error updating order ${orderId} status:`, error);
          return of({ success: false, message: 'Failed to update status' });
        })
      );
  }
} 