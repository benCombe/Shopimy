import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  categoryId: number;
  storeId: number;
  name: string;
  parentCategory?: number;
}

@Injectable({
  providedIn: 'root'
})

export class CategoryService {
  private baseUrl = `${environment.apiUrl}/api/categories`; // Updated to match backend URL

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl)
      .pipe(
        catchError(error => {
          console.error('Error fetching categories:', error);
          return of([]);
        })
      );
  }

  getCategoryById(id: number): Observable<Category | null> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching category ${id}:`, error);
          return of(null);
        })
      );
  }

  createCategory(category: { name: string; parentCategory?: number }): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category)
      .pipe(
        catchError(error => {
          console.error('Error creating category:', error);
          throw error;
        })
      );
  }

  updateCategory(id: number, category: { name: string; parentCategory?: number }): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, category)
      .pipe(
        catchError(error => {
          console.error(`Error updating category ${id}:`, error);
          throw error;
        })
      );
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error deleting category ${id}:`, error);
          throw error;
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
