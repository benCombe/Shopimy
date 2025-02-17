
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private baseUrl = '/api/categories'; // adjust the URL if needed

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
}
