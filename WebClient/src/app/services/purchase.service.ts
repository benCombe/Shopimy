import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PurchaseHistoryResponse {
  purchases: any[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private apiUrl = `${environment.apiUrl}/api/purchases`;

  constructor(private http: HttpClient) { }

  getPurchaseHistory(userId: number, page: number, itemsPerPage: number): Observable<PurchaseHistoryResponse> {
    return this.http.get<PurchaseHistoryResponse>(
      `${this.apiUrl}/history/${userId}?page=${page}&itemsPerPage=${itemsPerPage}`
    );
  }
} 