import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeliveryDetails } from '../models/delivery-details';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private apiUrl = `${environment.apiUrl}/user-delivery`;

  constructor(private http: HttpClient) {}

  // Save delivery address
  saveDeliveryAddress(deliveryDetails: DeliveryDetails): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/save`, deliveryDetails);
  }

  // Get all delivery addresses for a user
  getDeliveryAddresses(userId: number): Observable<DeliveryDetails[]> {
    return this.http.get<DeliveryDetails[]>(`${this.apiUrl}/addresses/${userId}`);
  }

  // Get a specific delivery address
  getDeliveryAddress(addressId: number): Observable<DeliveryDetails> {
    return this.http.get<DeliveryDetails>(`${this.apiUrl}/address/${addressId}`);
  }

  // Update a delivery address
  updateDeliveryAddress(addressId: number, deliveryDetails: DeliveryDetails): Observable<boolean> {
    return this.http.put<boolean>(`${this.apiUrl}/address/${addressId}`, deliveryDetails);
  }

  // Delete a delivery address
  deleteDeliveryAddress(addressId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/address/${addressId}`);
  }

  // Set default delivery address
  setDefaultDeliveryAddress(userId: number, addressId: number): Observable<boolean> {
    return this.http.put<boolean>(`${this.apiUrl}/default`, { userId, addressId });
  }
} 