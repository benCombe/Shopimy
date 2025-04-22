import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';
import { StoreService } from './store.service';

export interface Category {
  categoryId: number;
  storeId: number;
  name: string;
  parentCategory?: number | null;
}

// Interface for the request payload
export interface CategoryRequest {
  name: string;
  parentCategory?: number | null;
  storeId?: number;
}

@Injectable({
  providedIn: 'root'
})

export class CategoryService {
  private baseUrl = `${environment.apiUrl}/api/categories`; // Add /api/ prefix

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private storeService: StoreService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.cookieService.get('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getCategories(storeId?: number): Observable<Category[]> {
    let url = this.baseUrl;
    
    // Add storeId as query parameter if provided
    if (storeId && storeId > 0) {
      url += `?storeId=${storeId}`;
    }
    
    return this.http.get<Category[]>(url, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error fetching categories:', error);
          return of([]);
        })
      );
  }

  getCategoryById(id: number): Observable<Category | null> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error(`Error fetching category ${id}:`, error);
          return of(null);
        })
      );
  }

  createCategory(category: CategoryRequest): Observable<Category> {
    // The store ID will be determined from the JWT token on the server side
    return this.http.post<Category>(this.baseUrl, category, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error creating category:', error);
          throw error;
        })
      );
  }

  updateCategory(id: number, category: CategoryRequest): Observable<Category> {
    // The store ID will be determined from the JWT token on the server side
    return this.http.put<Category>(`${this.baseUrl}/${id}`, category, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error(`Error updating category ${id}:`, error);
          throw error;
        })
      );
  }

  deleteCategory(id: number): Observable<any> {
    return this.storeService.activeStore$.pipe(
      // Take only the first value (current store)
      tap(activeStore => {
        if (!environment.production) {
          console.log(`Current active store: `, activeStore);
        }
      }),
      // Switch to the HTTP delete observable
      switchMap(activeStore => {
        const storeId = activeStore?.id;
        
        // Add the storeId as a query parameter
        let url = `${this.baseUrl}/${id}`;
        if (storeId) {
          url += `?storeId=${storeId}`;
        }
        
        // Log the URL in development mode for debugging
        if (!environment.production) {
          console.log(`Deleting category with URL: ${url} (Store ID: ${storeId})`);
        }
        
        return this.http.delete<any>(url, { headers: this.getHeaders() })
          .pipe(
            catchError(error => {
              // Format error message based on status code
              if (error.status === 404) {
                error.message = `Category with ID ${id} not found or already deleted`;
                // Only log to console in development mode
                if (!environment.production) {
                  console.warn(`Category deletion 404: ${error.message}`);
                }
              } else if (error.status === 403) {
                console.error(`Permission denied when deleting category ${id}:`, error);
                error.message = 'You do not have permission to delete this category';
              } else if (error.status === 400) {
                console.error(`Bad request when deleting category ${id}:`, error);
                error.message = error.error?.message || 'Invalid request when deleting category';
              } else {
                console.error(`Server error when deleting category ${id}:`, error);
                error.message = 'Server error occurred while deleting the category';
              }
              throw error;
            })
          );
      })
    );
  }

  getItemsInCategory(catId: number, storeId: number): Observable<number[]> {
    const url = `${this.baseUrl}/${catId}/${storeId}`;
    console.log("Getting Item Ids from: ", catId, storeId);

    return this.http.get<number[]>(url).pipe(
      tap(response => {
        console.log('Response from API:', response);
      }),
      catchError(error => {
        console.error(`Error fetching items in category ${catId}:`, error);
        return of([]);
      })
    );
  }

  getItemIdsByStore(storeId: number): Observable<number[]> {
    const url = `${this.baseUrl}/GetItemIdsByStore`;

    return this.http.post<number[]>(url, storeId).pipe(
      catchError(error => {
        console.error(`Error fetching items for store ${storeId}:`, error);
        return of([]);
      })
    );
  }

  getRandomItems(catId: number, storeId: number, limit: number): number[]{
    //this will fetch a limited randomized list of items listed in a store/category

    /*
       Example backend controller query:

       SELECT TOP {limit} * FROM Items
       WHERE store_id = {storeId}
       AND category_id = {catId}
       ORDER BY NEWID();

    */

    return [];
  }
}
