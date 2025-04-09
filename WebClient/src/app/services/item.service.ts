import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Item } from '../models/item';
import { environment } from '../../environments/environment';
import { BasicItem } from '../models/basic-item';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  // Base URL for the items endpoint. Adjust if your API path is different.
  private itemBaseUrl = `${environment.apiUrl}/item`;

  constructor(private http: HttpClient) {}

  // Creates a new item
  createItem(item: Item): Observable<Item> {
    return this.http.post<Item>(this.itemBaseUrl, item);
  }

  // Retrieves all items
  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.itemBaseUrl);
  }

  // Retrieves a single item by its ID.
  // Replace the mock implementation with a real API call when available.
  getItemById(id: number): Observable<BasicItem> {
    const url = `${this.itemBaseUrl}/BasicItem/${id}`;  // Correct endpoint for fetching a single item
    console.log('Fetching item from:', url);
    return this.http.get<BasicItem>(url).pipe(
      tap(response => {
        console.log('Response from API:', response);  // Log the response for debugging
      })
    );
  }


  // Updates the stock level for a given item.
  updateStock(itemId: number, newStock: number): Observable<Item> {
    return this.http.put<Item>(`${this.itemBaseUrl}/${itemId}/stock`, { quantityInStock: newStock });
  }
}
