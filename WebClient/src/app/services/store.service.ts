import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Item } from '../models/item'; // Assume you have this model

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // Base URL for the items endpoint; update if your API uses a different route.
  private itemBaseUrl = '/api/items';
  // Example base URL for the categories endpoint.
  private categoryBaseUrl = '/api/categories';

  constructor(private http: HttpClient) { }

  // Creates a new item
  createItem(item: Item): Observable<Item> {
    return this.http.post<Item>(this.itemBaseUrl, item);
  }

  // Retrieves all items
  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.itemBaseUrl);
  }

  // Example method for fetching categories for a store
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.categoryBaseUrl);
  }
  getItemById(id: string): Observable<Item> {
    // Mock implementation, replace with actual API call
    const mockItem: Item = { 
      Id: id, 
      Name: 'Mock Item', 
      SalePrice: 100, 
      OriginalPrice: 150, 
      OnSale: true, 
      Description: 'This is a mock item', 
      QuantityInStock: 10, 
      CategoryIds: [1], 
      ImageUrl: 'mock-image-url',
      AvailFrom: new Date(),
      AvailTo: new Date(),
      CurrentRating: 5
    };
    return of(mockItem);
  }
  updateStock(itemId: string, newStock: number): Observable<Item> {
    return this.http.put<Item>(`${this.itemBaseUrl}/${itemId}/stock`, { quantityInStock: newStock });
  }
}
