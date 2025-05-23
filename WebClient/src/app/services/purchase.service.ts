import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';

export interface OrderHistoryProductDTO {
  productName: string;
  quantity: number;
  pricePaid: number;
}

export interface OrderHistoryItemDTO {
  orderId: number;
  orderDate: Date;
  storeName: string;
  totalAmount: number;
  status: string;
  items: OrderHistoryProductDTO[];
}

export interface PurchaseHistoryResponse {
  purchases: OrderHistoryItemDTO[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private apiUrl = `${environment.apiUrl}/api/account`;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) { }

  getPurchaseHistory(page: number, itemsPerPage: number): Observable<PurchaseHistoryResponse> {
    const token = this.cookieService.get('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<PurchaseHistoryResponse>(
      `${this.apiUrl}/purchase-history?page=${page}&itemsPerPage=${itemsPerPage}`,
      { headers }
    );
  }
} 