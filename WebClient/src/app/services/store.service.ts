import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { Item } from '../models/item'; // Assume you have this model
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

  // Base URLs for items and categories endpoints.
  private itemBaseUrl = '/api/items';
  private categoryBaseUrl = '/api/categories';

  // Set up the active store with a default StoreDetails instance.
  activeStoreSubject: BehaviorSubject<StoreDetails> = new BehaviorSubject<StoreDetails>(
    new StoreDetails(
      0,                              // id
      "knittingnut",                  // url
      "KnittingNut",                  // name
      "#0f5e16",                      // Theme_1
      "#88AA99",                      // Theme_2
      "#cafadb",                      // Theme_3
      "Cambria, Cochin",              // FontFamily
      "#f6f6f6",                      // FontColor
      "Explore Our Knitting Products!", // bannerText
      "TEXT ABOUT THE STORE AND WHY IT IS AWHSUM", // logoText
      []                              // Categories
    )
  );

  activeStore$: Observable<StoreDetails> = this.activeStoreSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Active getStoreDetails method: maps the response to a new StoreDetails instance.
  getStoreDetails(url: string): Observable<StoreDetails> {
    return this.http.get<StoreDetails>(`${this.apiUrl}/${url}`).pipe(
      map((resp) => {
        return new StoreDetails(
          resp.id, // Ensure ID is a string or number as expected
          resp.url,
          resp.name,
          resp.theme_1,
          resp.theme_2,
          resp.theme_3,
          resp.fontColor,
          resp.fontFamily,
          resp.bannerText,
          resp.logoText,
          resp.categories.map(cat =>
            new Category(cat.categoryId, cat.storeId, cat.name, cat.parentCategory)
          )
        );
      }),
      tap((storeDetails) => {
        this.activeStoreSubject.next(storeDetails);
        console.log("Mapped StoreDetails:", storeDetails);
      }),
      catchError((error) => {
        console.error('Error fetching store details:', error);
        return throwError(() => new Error('Failed to fetch store details.'));
      })
    );
  }

  /*
  // Alternative implementation (commented out):
  getStoreDetails(url: string): Observable<Response> {
    return this.http.get<Response>(`${this.apiUrl}/${url}`).pipe(
      tap((resp) => {
        this.activeStoreSubject.next(resp.details);
        // If you have an activeStoreCategorySubject, update it here:
        // this.activeStoreCategorySubject.next(resp.categories);
      }),
      catchError((error) => {
        console.error('Error fetching store details:', error);
        return throwError(() => new Error('Failed to fetch store details.'));
      })
    );
  }
  */

  // Retrieves categories from the API.
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/categories`);
  }
}
