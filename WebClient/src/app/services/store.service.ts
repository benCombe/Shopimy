import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
}
