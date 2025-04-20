import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { Item } from '../models/item'; // Assume you have this model
import { StoreDetails } from '../models/store-details';
import { Category } from '../models/category';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators'; // For simulating async operations
import { ComponentVisibility, DEFAULT_VISIBILITY } from '../models/component-visibility.model';
import { CookieService } from './cookie.service'; // Import CookieService

// Define an interface for API serialization that extends StoreDetails
interface StoreDetailsForApi extends Omit<StoreDetails, 'componentVisibility'> {
  componentVisibility: string;
}

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

  constructor(
    private http: HttpClient, 
    private router: Router,
    private cookieService: CookieService // Inject CookieService
  ) { }

  // Use BehaviorSubject to hold the current theme and allow easy access/updates
  // Initialize with a default theme or load from local storage/backend
  private currentThemeSubject = new BehaviorSubject<string>('light');
  currentTheme$ = this.currentThemeSubject.asObservable();

  // TODO: Potentially load initial theme from a persistent source (e.g., backend, localStorage)

  // Method to create a new store.
  createStore(storeData: StoreDetails): Observable<StoreDetails> {
    // Convert to API format (serialize componentVisibility)
    const storeDataForApi = this.prepareStoreDataForApi(storeData);
    const token = this.cookieService.get('auth_token'); // Get token from CookieService
    if (!token) {
      console.error('Authentication token not found. Cannot create store.');
      return throwError(() => new Error('Authentication required.'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Create headers

    return this.http.post<StoreDetails>(this.apiUrl, storeDataForApi, { headers }).pipe( // Add headers to request
      tap((newStore) => {
        // Update the active store
        this.activeStoreSubject.next(this.deserializeStore(newStore));
        console.log('Store created successfully:', newStore);
      }),
      catchError((error) => {
        console.error('Error creating store:', error);
        return throwError(() => new Error('Failed to create store.'));
      })
    );
  }

  // Get the current user's store
  getCurrentUserStore(): Observable<StoreDetails> {
    const token = this.cookieService.get('auth_token'); // Get token from CookieService
    if (!token) {
      console.error('Authentication token not found. Cannot get user store.');
      return throwError(() => new Error('Authentication required.'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Create headers

    return this.http.get<StoreDetails>(this.apiUrl, { headers }).pipe( // Add headers to request
      map(store => this.deserializeStore(store)),
      tap(store => {
        this.activeStoreSubject.next(store);
      }),
      catchError(error => {
        console.error('Error fetching current user store', error);
        return throwError(() => new Error('Failed to fetch current user store.'));
      })
    );
  }

  // Active getStoreDetails method: maps the response to a new StoreDetails instance.
  getStoreDetails(url: string): Observable<StoreDetails> {
    return this.http.get<StoreDetails>(`${this.apiUrl}/${url}`).pipe(
      map(resp => this.deserializeStore(resp)),
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

  // Helper function to prepare store data for API
  private prepareStoreDataForApi(store: StoreDetails): StoreDetailsForApi {
    // Create a copy of the store object
    const storeDataCopy = { ...store } as any;
    
    // Serialize componentVisibility if it exists
    if (storeDataCopy.componentVisibility) {
      storeDataCopy.componentVisibility = JSON.stringify(storeDataCopy.componentVisibility);
    }
    
    return storeDataCopy as StoreDetailsForApi;
  }

  // Helper function to deserialize store data from the API
  private deserializeStore(store: any): StoreDetails {
    // Parse component visibility if it's a string
    let componentVisibility: ComponentVisibility | undefined;
    if (store.componentVisibility) {
      try {
        if (typeof store.componentVisibility === 'string') {
          componentVisibility = JSON.parse(store.componentVisibility);
        } else {
          componentVisibility = store.componentVisibility as ComponentVisibility;
        }
      } catch (e) {
        console.error('Error parsing component visibility', e);
        componentVisibility = DEFAULT_VISIBILITY;
      }
    } else {
      componentVisibility = DEFAULT_VISIBILITY;
    }
    
    return new StoreDetails(
      store.id, 
      store.url,
      store.name,
      store.theme_1,
      store.theme_2,
      store.theme_3,
      store.fontColor,
      store.fontFamily,
      store.bannerText,
      store.logoText,
      store.bannerURL,
      store.logoURL,
      store.categories?.map((cat: any) =>
        new Category(cat.categoryId, cat.storeId, cat.name, cat.parentCategory)
      ) || [],
      componentVisibility
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
    // Convert to API format (serialize componentVisibility)
    const storeDataForApi = this.prepareStoreDataForApi(store);
    const token = this.cookieService.get('auth_token'); // Get token from CookieService
    if (!token) {
      console.error('Authentication token not found. Cannot update store.');
      return throwError(() => new Error('Authentication required.'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Create headers
    
    // Send update to backend
    return this.http.put<StoreDetails>(`${this.apiUrl}/update`, storeDataForApi, { headers }).pipe( // Add headers to request
      map(response => this.deserializeStore(response)),
      tap(updatedStore => {
        // Update the BehaviorSubject with the response from the server
        this.activeStoreSubject.next(updatedStore);
      }),
      catchError(error => {
        console.error('Error updating store', error);
        return throwError(() => new Error('Failed to update store configuration.'));
      })
    );
  }

  // Update component visibility
  updateComponentVisibility(visibility: ComponentVisibility): Observable<StoreDetails> {
    const currentStore = this.activeStoreSubject.value;
    const updatedStore = { 
      ...currentStore, 
      componentVisibility: visibility 
    };
    
    return this.updateStore(updatedStore);
  }

  // TODO: Add methods for saving/loading other store settings as needed
}
