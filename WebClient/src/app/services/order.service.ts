import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, switchMap, map } from 'rxjs';
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
    
        return this.http.get<Order[]>(this.apiUrl, { headers }).pipe(
          catchError(error => {
            // If unauthorized and the error message contains 'Store ID not found in claims'
            if (error.status === 401 && error.error === 'Store ID not found in claims or invalid') {
              console.log('Attempting to refresh token to get storeId claim...');
              // Try to refresh the token first
              return this.refreshToken().pipe(
                switchMap(refreshResult => {
                  if (refreshResult.success) {
                    console.log('Token refreshed successfully, retrying orders fetch');
                    // Retry with the new token
                    const newToken = this.cookieService.get('auth_token');
                    const newHeaders = new HttpHeaders().set('Authorization', `Bearer ${newToken}`);
                    return this.http.get<Order[]>(this.apiUrl, { headers: newHeaders });
                  } else {
                    console.error('Token refresh failed:', refreshResult.message);
                    return of([]);
                  }
                }),
                catchError(refreshError => {
                  console.error('Error refreshing token:', refreshError);
                  return of([]);
                })
              );
            }
            
            console.error('Error fetching orders:', error);
            return of([]);
          })
        );
      })
    );
  }

  /**
   * Refreshes the authentication token to ensure it has all necessary claims
   */
  private refreshToken(): Observable<{success: boolean, message: string}> {
    const token = this.cookieService.get('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.post<any>(`${environment.apiUrl}/api/account/refresh-token`, {}, { headers }).pipe(
      map(response => {
        if (response && response.Token) {
          // Save the new token (note: using 'Token' with uppercase T to match backend response)
          this.cookieService.set('auth_token', response.Token, 3); // 3 days
          return { success: true, message: 'Token refreshed' };
        } else {
          return { success: false, message: 'Invalid response from refresh endpoint' };
        }
      }),
      catchError(error => {
        console.error('Error in refreshToken:', error);
        return of({ success: false, message: 'Token refresh failed' });
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
    
        return this.http.get<Order>(`${this.apiUrl}/${id}`, { headers }).pipe(
          catchError(error => {
            // If unauthorized and the error message contains 'Store ID not found in claims'
            if (error.status === 401 && error.error === 'Store ID not found in claims or invalid') {
              console.log('Attempting to refresh token to get storeId claim...');
              // Try to refresh the token first
              return this.refreshToken().pipe(
                switchMap(refreshResult => {
                  if (refreshResult.success) {
                    console.log('Token refreshed successfully, retrying order fetch');
                    // Retry with the new token
                    const newToken = this.cookieService.get('auth_token');
                    const newHeaders = new HttpHeaders().set('Authorization', `Bearer ${newToken}`);
                    return this.http.get<Order>(`${this.apiUrl}/${id}`, { headers: newHeaders });
                  } else {
                    console.error('Token refresh failed:', refreshResult.message);
                    return of(undefined);
                  }
                }),
                catchError(refreshError => {
                  console.error('Error refreshing token:', refreshError);
                  return of(undefined);
                })
              );
            }
            
            console.error(`Error fetching order ${id}:`, error);
            return of(undefined);
          })
        );
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
    
        return this.http.patch(`${this.apiUrl}/${orderId}`, { status }, { headers }).pipe(
          catchError(error => {
            // If unauthorized and the error message contains 'Store ID not found in claims'
            if (error.status === 401 && error.error === 'Store ID not found in claims or invalid') {
              console.log('Attempting to refresh token to get storeId claim...');
              // Try to refresh the token first
              return this.refreshToken().pipe(
                switchMap(refreshResult => {
                  if (refreshResult.success) {
                    console.log('Token refreshed successfully, retrying status update');
                    // Retry with the new token
                    const newToken = this.cookieService.get('auth_token');
                    const newHeaders = new HttpHeaders().set('Authorization', `Bearer ${newToken}`);
                    return this.http.patch(`${this.apiUrl}/${orderId}`, { status }, { headers: newHeaders });
                  } else {
                    console.error('Token refresh failed:', refreshResult.message);
                    return of({ success: false, message: 'Failed to update status - token refresh failed' });
                  }
                }),
                catchError(refreshError => {
                  console.error('Error refreshing token:', refreshError);
                  return of({ success: false, message: 'Failed to update status - error refreshing token' });
                })
              );
            }
            
            console.error(`Error updating order ${orderId} status:`, error);
            return of({ success: false, message: 'Failed to update status' });
          })
        );
      })
    );
  }
} 