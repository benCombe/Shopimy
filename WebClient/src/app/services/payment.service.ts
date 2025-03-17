import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'https://yourapi.com/api/payment';

  constructor(private http: HttpClient) {}

  createCheckoutSession(amount: number, productName: string): Observable<{ sessionUrl: string }> {
    return this.http.post<{ sessionUrl: string }>(`${this.apiUrl}/create-checkout-session`, { amount, productName });
  }
}
