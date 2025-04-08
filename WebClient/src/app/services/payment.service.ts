import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentDetails } from '../models/payment-details';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  // Use base API URL from environment for consistency
  private apiUrl = `${environment.apiUrl}/payment`;
  private userPaymentUrl = `${environment.apiUrl}/user-payment`;

  constructor(private http: HttpClient) {}

  // New method to get Stripe public key
  getStripePublicKey(): Observable<{ publicKey: string }> {
    // Assuming endpoint /api/stripe/config or similar
    return this.http.get<{ publicKey: string }>(`${environment.apiUrl}/stripe/config`);
  }

  // New method to create SetupIntent
  createSetupIntent(): Observable<{ clientSecret: string }> {
    // Assuming endpoint /api/user-payment/create-setup-intent
    return this.http.post<{ clientSecret: string }>(`${this.userPaymentUrl}/create-setup-intent`, {});
  }

  createCheckoutSession(amount: number, productName: string, storeId?: string): Observable<{ sessionUrl: string }> {
    return this.http.post<{ sessionUrl: string }>(`${this.apiUrl}/create-checkout-session`, { amount, productName, storeId });
  }
  
  // Remove old savePaymentInformation
  // savePaymentInformation(paymentDetails: PaymentDetails): Observable<boolean> {
  //   return this.http.post<boolean>(`${this.userPaymentUrl}/save`, paymentDetails);
  // }

  // New method to save the PaymentMethod ID from Stripe
  savePaymentMethod(paymentMethodId: string, isDefault: boolean): Observable<any> {
    // Assuming endpoint /api/user-payment/save-method
    return this.http.post<any>(`${this.userPaymentUrl}/save-method`, { paymentMethodId, isDefault });
  }

  // Get saved payment methods for the user (response might need adjustment later)
  getPaymentMethods(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.userPaymentUrl}/methods/${userId}`);
  }

  // Delete a payment method (endpoint might need adjustment)
  deletePaymentMethod(paymentMethodId: string): Observable<boolean> {
    // The identifier might change from 'paymentId' to Stripe's PaymentMethod ID (string)
    return this.http.delete<boolean>(`${this.userPaymentUrl}/methods/${paymentMethodId}`); 
  }

  // Set default payment method (endpoint might need adjustment)
  setDefaultPaymentMethod(userId: number, paymentMethodId: string): Observable<boolean> {
    // The identifier might change from 'paymentId' to Stripe's PaymentMethod ID (string)
    return this.http.put<boolean>(`${this.userPaymentUrl}/default`, { userId, paymentMethodId });
  }
}
