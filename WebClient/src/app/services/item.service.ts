import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Item } from '../models/item';
import { environment } from '../../environments/environment';
import { BasicItem } from '../models/basic-item';

// Interface for product creation/update
export interface ProductPayload {
  listId?: number;       // Only for updates
  name: string;
  description: string;
  categoryId: number;
  storeId: number;
  variants: {
    id?: number;         // Only for updates
    price: number;
    salePrice?: number;  // Optional
    quantity: number;
    type?: string;       // Optional
    size?: string;       // Optional
    color?: string;      // Optional
  }[];
}

// Interface for image upload response
export interface ImageUploadResponse {
  imageUrl: string;
}

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

  // --- New Methods ---

  // Create a new product (with variants)
  createProduct(product: ProductPayload): Observable<any> {
    return this.http.post(`${this.itemBaseUrl}/product`, product);
  }

  // Update an existing product (with variants)
  updateProduct(productId: number, product: ProductPayload): Observable<any> {
    return this.http.put(`${this.itemBaseUrl}/product/${productId}`, product);
  }

  // Delete a product by ID
  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.itemBaseUrl}/product/${productId}`);
  }

  // Upload a product image
  uploadProductImage(itemId: number, storeId: number, file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('itemId', itemId.toString());
    formData.append('storeId', storeId.toString());
    
    return this.http.post<ImageUploadResponse>(`${this.itemBaseUrl}/image`, formData);
  }

  // Get items by store ID
  getItemsByStore(storeId: number): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.itemBaseUrl}/store/${storeId}`);
  }
}
