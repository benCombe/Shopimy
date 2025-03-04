import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Item } from '../models/item';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  // Base URL for the items endpoint. Adjust if your API path is different.
  private itemBaseUrl = `${environment.apiUrl}/api/items`;

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
  getItemById(id: string): Observable<Item> {
    // API call:
    return this.http.get<Item>(`${this.itemBaseUrl}/${id}`);

    /*Mock implementation:
    const mockItem: Item = {
      Id: id,
      Name: 'Mock Item',
      SalePrice: 100,
      OriginalPrice: 150,
      OnSale: true,
      Description: 'This is a mock item for testing.',
      QuantityInStock: 10,
      CategoryIds: [1],
      ImageUrl: 'assets/images/default.png',
      AvailFrom: new Date(),
      AvailTo: new Date(),
      CurrentRating: 5
    };
    return of(mockItem);
    */
  }

  // Updates the stock level for a given item.
  updateStock(itemId: string, newStock: number): Observable<Item> {
    return this.http.put<Item>(`${this.itemBaseUrl}/${itemId}/stock`, { quantityInStock: newStock });
  }
}
