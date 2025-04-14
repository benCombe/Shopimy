
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})

export class CategoryService {
  private baseUrl = '/api/categories'; // adjust the URL if needed

    private defaultCategory: Category = new Category(0, 0, "example",null ); //Default Category
    private activeCategorySubject = new BehaviorSubject<Category>(this.defaultCategory);
    public activeCategory$ : Observable<Category> = this.activeCategorySubject.asObservable();

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  createCategory(category: { name: string; parentCategory?: number }): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }

  updateCategory(id: number, category: { name: string; parentCategory?: number }): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }


  getItemsInCategory(catId: number, storeId: number): Observable<number[]> {
    const url = `${this.baseUrl}/${catId}/${storeId}`;  // Ensure the correct endpoint format
    console.log("Getting Item Ids from: ", catId, storeId);

    return this.http.get<number[]>(url).pipe(
      tap(response => {
        console.log('Response from API:', response); // Log the response
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
