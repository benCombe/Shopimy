import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentDetails } from '../models/payment-details';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'https://shopimy.com/api/payment';
  private userPaymentUrl = `${environment.apiUrl}/user-payment`;

  constructor(private http: HttpClient) {}

  createCheckoutSession(amount: number, productName: string, storeId?: string): Observable<{ sessionUrl: string }> {
    return this.http.post<{ sessionUrl: string }>(`${this.apiUrl}/create-checkout-session`, { amount, productName, storeId });
  }
  
  // Save payment information - will be encrypted on the server
  savePaymentInformation(paymentDetails: PaymentDetails): Observable<boolean> {
    return this.http.post<boolean>(`${this.userPaymentUrl}/save`, paymentDetails);
  }

  // Get saved payment methods for the user
  getPaymentMethods(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.userPaymentUrl}/methods/${userId}`);
  }

  // Delete a payment method
  deletePaymentMethod(paymentId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.userPaymentUrl}/methods/${paymentId}`);
  }

  // Set default payment method
  setDefaultPaymentMethod(userId: number, paymentId: number): Observable<boolean> {
    return this.http.put<boolean>(`${this.userPaymentUrl}/default`, { userId, paymentId });
  }
}
