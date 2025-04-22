import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { Item } from '../models/item';
import { environment } from '../../environments/environment';
import { BasicItem } from '../models/basic-item';

// Interface for product creation/update
export interface ProductCreatePayload {
  storeId: number;
  name: string;
  description: string;
  categoryId: number;
  availFrom?: Date | null;
  availTo?: Date | null;
  variants: ProductVariantPayload[];
}

export interface ProductUpdatePayload {
  name: string;
  description: string;
  categoryId: number;
  availFrom?: Date | null;
  availTo?: Date | null;
  variants: ProductVariantPayload[];
  deletedVariantIds?: number[];
}

export interface ProductVariantPayload {
  itemId?: number;      // 0 for new variants, > 0 for existing variants in updates
  price: number;
  salePrice: number;
  quantity: number;
  type?: string;
  size?: string;
  colour?: string;      // Note: UK spelling in database
  images?: string[];    // Base64 or URLs
}

// Interface for image upload
export interface ImageUploadRequest {
  imageData: string;    // Base64 encoded image
}

export interface ImageUploadResponse {
  imageUrl: string;
}

// Interface for product list item (for store display)
export interface ProductListItem {
  listId: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  minPrice: number;
  maxPrice: number;
  totalQuantity: number;
  imageUrl?: string;
  availFrom?: Date | null;
  availTo?: Date | null;
  status?: 'Draft' | 'Published' | 'Scheduled' | 'Expired';
}

// Interface for detailed product with variants
export interface ProductDetail {
  listId: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  storeId: number;
  availFrom?: Date;
  availTo?: Date;
  rating: number;
  variants: ProductVariant[];
}

export interface ProductVariant {
  itemId: number;
  price: number;
  salePrice: number;
  quantity: number;
  type?: string;
  size?: string;
  colour?: string;
  images: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  // Base URL for the items endpoint
  private apiUrl = `${environment.apiUrl}/api/Item`;

  constructor(private http: HttpClient) {}

  // Retrieves a single item by its ID
  getItemById(id: number): Observable<BasicItem> {
    const url = `${this.apiUrl}/BasicItem/${id}`;
    console.log('Fetching item from:', url);
    return this.http.get<BasicItem>(url).pipe(
      tap(response => {
        console.log('Response from API:', response);
      }),
      catchError(error => {
        console.error(`Error fetching item ${id}:`, error);
        throw error; // Re-throw to allow component to handle
      })
    );
  }

  // Get products by store ID
  getItemsByStore(storeId: number): Observable<ProductListItem[]> {
    return this.http.get<ProductListItem[]>(`${this.apiUrl}/bystore/${storeId}`).pipe(
      catchError(error => {
        console.error(`Error fetching items for store ${storeId}:`, error);
        return of([]);
      })
    );
  }

  // Get detailed product with variants
  getProductDetails(productId: number): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${this.apiUrl}/${productId}`).pipe(
      catchError(error => {
        console.error(`Error fetching product details for ${productId}:`, error);
        throw error;
      })
    );
  }

  // Create a new product with variants
  createProduct(product: ProductCreatePayload): Observable<any> {
    return this.http.post(this.apiUrl, product).pipe(
      catchError(error => {
        console.error('Error creating product:', error);
        throw error;
      })
    );
  }

  // Update an existing product
  updateProduct(productId: number, product: ProductUpdatePayload): Observable<any> {
    return this.http.put(`${this.apiUrl}/${productId}`, product).pipe(
      catchError(error => {
        console.error(`Error updating product ${productId}:`, error);
        throw error;
      })
    );
  }

  // Delete a product
  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}`).pipe(
      catchError(error => {
        console.error(`Error deleting product ${productId}:`, error);
        throw error;
      })
    );
  }

  // Upload a product image (base64)
  uploadProductImage(imageData: string): Observable<ImageUploadResponse> {
    const payload: ImageUploadRequest = { imageData };
    // Point to the new ImageController endpoint
    return this.http.post<ImageUploadResponse>(`${environment.apiUrl}/api/image/upload`, payload).pipe(
      catchError(error => {
        console.error('Error uploading image:', error);
        throw error;
      })
    );
  }
}
