import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Promotion, CreatePromotionRequest } from '../models/promotion.model';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class PromotionsService {
  private apiUrl = `${environment.apiUrl}/api/Promotions`;
  
  constructor(private http: HttpClient, private cookieService: CookieService) { }
  
  // Get all promotions for the user's store
  getPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.apiUrl, this.getHeaders());
  }
  
  // Get a specific promotion by ID
  getPromotion(id: number): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiUrl}/${id}`, this.getHeaders());
  }
  
  // Create a new promotion
  createPromotion(promotion: CreatePromotionRequest): Observable<Promotion> {
    return this.http.post<Promotion>(this.apiUrl, promotion, this.getHeaders());
  }
  
  // Update an existing promotion
  updatePromotion(id: number, promotion: Promotion): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.apiUrl}/${id}`, promotion, this.getHeaders());
  }
  
  // Delete a promotion
  deletePromotion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders());
  }
  
  // Helper to get headers with authentication token
  private getHeaders() {
    const token = this.cookieService.get('auth_token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }
} 