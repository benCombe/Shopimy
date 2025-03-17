import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'https://shopimy.com/api/payment';

  constructor(private http: HttpClient) {}

  createCheckoutSession(amount: number, productName: string, storeId?: string): Observable<{ sessionUrl: string }> {
    return this.http.post<{ sessionUrl: string }>(`${this.apiUrl}/create-checkout-session`, { amount, productName, storeId });
  }  
}
