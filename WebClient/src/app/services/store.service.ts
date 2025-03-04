import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { StoreDetails } from '../models/store-details';
import { Category } from '../models/category';
import { environment } from '../../environments/environment';

interface Response {
  details: StoreDetails;
  categories: Category[];
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private apiUrl = `${environment.apiUrl}/store`;

  activeStoreSubject: BehaviorSubject<StoreDetails> = new BehaviorSubject<StoreDetails>(
    new StoreDetails(
      "0000",
      "knittingnut",
      "KnittingNut",  // Default store name, etc.
      "#0f5e16",
      "#88AA99",
      "#cafadb",
      "Cambria, Cochin",
      "#f6f6f6",
      "Explore Our Knitting Products!",
      "TEXT ABOUT THE STORE AND WHY IT IS AWHSUM",
      []  // Empty array for Categories
    )
  );
  
  activeStore$: Observable<StoreDetails> = this.activeStoreSubject.asObservable();

  activeStoreCategorySubject: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
  activeStoreCategory$: Observable<Category[]> = this.activeStoreCategorySubject.asObservable();

  constructor(private http: HttpClient) { }

  getStoreDetails(url: string): Observable<Response> {
    return this.http.get<Response>(`${this.apiUrl}/${url}`).pipe(
      tap((resp) => {
        this.activeStoreSubject.next(resp.details);
        this.activeStoreCategorySubject.next(resp.categories);
      }),
      catchError((error) => {
        console.error('Error fetching store details:', error);
        return throwError(() => new Error('Failed to fetch store details.'));
      })
    );
  }

  // You can keep getCategories() if it's store-specific.
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/categories`);
  }
}
