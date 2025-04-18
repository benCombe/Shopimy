import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { Item } from '../models/item'; // Assume you have this model
import { StoreDetails } from '../models/store-details';
import { Category } from '../models/category';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators'; // For simulating async operations


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

  activeStoreSubject: BehaviorSubject<StoreDetails> = new BehaviorSubject<StoreDetails>(new StoreDetails(0, "DEFAULT", "DEFAULT", "#232323", "#545454", "#E1E1E1",  "#f6f6f6", "Cambria, Cochin", "BANNER TEXT", "LOGO TEXT", "", "", []));
  activeStore$: Observable<StoreDetails> = this.activeStoreSubject.asObservable();

  constructor(private http: HttpClient, private router: Router ) { }

  // Use BehaviorSubject to hold the current theme and allow easy access/updates
  // Initialize with a default theme or load from local storage/backend
  private currentThemeSubject = new BehaviorSubject<string>('light');
  currentTheme$ = this.currentThemeSubject.asObservable();

  // TODO: Potentially load initial theme from a persistent source (e.g., backend, localStorage)

  // Method to create a new store.
  createStore(storeData: any): Observable<StoreDetails> {
    return this.http.post<StoreDetails>(this.apiUrl, storeData).pipe(
      tap((newStore) => {
        // Optionally update the active store or log success
        console.log('Store created successfully:', newStore);
        // If the creation response returns the full StoreDetails,
        // you might want to update the activeStoreSubject here:
        // this.activeStoreSubject.next(newStore);
      }),
      catchError((error) => {
        console.error('Error creating store:', error);
        return throwError(() => new Error('Failed to create store.'));
      })
    );
  }

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
          resp.bannerURL,
          resp.logoURL,
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
        if (error.status === 404) {
          this.router.navigate(['/404']); // Navigate to the 404 page
        }
        console.error('Error fetching store details:', error);
        return throwError(() => new Error('Failed to fetch store details.'));
      })
    );
  }

  getCategoryByName(name: string): Category | null {
    return this.activeStoreSubject.value.categories.find(cat => cat.name === name) ?? null;
  }

  // Retrieves categories from the API.
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/categories`);
  }

  getRandomItemIdsByStore(storeId: number): Observable<number[]> {
    return this.http.post<number[]>('http://localhost:5000/api/Categories/GetItemIdsByStore', storeId, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Gets the current theme ID as an Observable.
   */
  getCurrentTheme(): Observable<string> {
    // Return the observable stream of the current theme
    return this.currentTheme$;
    // --- Example simulating backend call ---
    // console.log('StoreService: Fetching current theme...');
    // return of('dark').pipe(delay(500)); // Simulate async fetch
  }

  /**
   * Saves the selected theme ID.
   * @param themeId The ID of the theme to save (e.g., 'light', 'dark')
   */
  saveTheme(themeId: string): Observable<boolean> {
    console.log(`StoreService: Saving theme '${themeId}'`);
    // Update the BehaviorSubject, which notifies all subscribers
    this.currentThemeSubject.next(themeId);
    // TODO: Add logic here to persist the themeId to your backend or local storage
    // For now, simulate a successful save operation
    return of(true).pipe(delay(300)); // Simulate async save
  }

  updateStore(store: StoreDetails): Observable<StoreDetails> {
    // Update the local BehaviorSubject
    this.activeStoreSubject.next(store);
    
    // Send update to backend
    return this.http.put<StoreDetails>(`${this.apiUrl}/update`, store).pipe(
      tap(updatedStore => {
        // Update the BehaviorSubject with the response from the server
        this.activeStoreSubject.next(updatedStore);
      })
    );
  }

  // TODO: Add methods for saving/loading other store settings as needed
}
