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
  private apiUrl = `${environment.apiUrl}/api/store`;

  // Base URLs for items and categories endpoints.
  // These seem unused, potentially remove later if confirmed.
  // private itemBaseUrl = '/api/items';
  // private categoryBaseUrl = '/api/categories';

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

    console.log("Fetching current user store with auth token:", token.substring(0, 10) + "...");
    return this.http.get<StoreDetails>(this.apiUrl, { headers }).pipe( // Add headers to request
      map(store => {
        console.log("Raw store response from API:", store);
        if (store && typeof store === 'object') {
          // Ensure store has an ID and isn't empty
          if (!store.id || store.id === 0) {
            console.warn("Store returned from API has no ID or ID=0:", store);
          }
          if (store.name === 'DEFAULT' || !store.name) {
            console.warn("Store has default or empty name:", store.name);
          }
          if (store.url === 'DEFAULT' || !store.url) {
            console.warn("Store has default or empty URL:", store.url);
          }
          return this.deserializeStore(store);
        } else {
          console.error("Invalid store data returned from API:", store);
          return new StoreDetails(0, '', '', '#393727', '#D0933D', '#D3CEBB', '#333333', 'sans-serif', '', '', '', '', [], DEFAULT_VISIBILITY);
        }
      }),
      tap(store => {
        console.log("Setting active store after deserialization:", store);
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

    // Ensure all required fields have valid values
    if (!storeDataCopy.name || storeDataCopy.name === 'DEFAULT') {
      storeDataCopy.name = "My Store";
    }

    if (!storeDataCopy.url || storeDataCopy.url === 'DEFAULT') {
      storeDataCopy.url = "my-store";
    }

    // Validate color formats - ensure they start with #
    if (!storeDataCopy.theme_1 || !storeDataCopy.theme_1.startsWith('#')) {
      storeDataCopy.theme_1 = "#393727";
    }
    if (!storeDataCopy.theme_2 || !storeDataCopy.theme_2.startsWith('#')) {
      storeDataCopy.theme_2 = "#D0933D";
    }
    if (!storeDataCopy.theme_3 || !storeDataCopy.theme_3.startsWith('#')) {
      storeDataCopy.theme_3 = "#D3CEBB";
    }
    if (!storeDataCopy.fontColor || !storeDataCopy.fontColor.startsWith('#')) {
      storeDataCopy.fontColor = "#333333";
    }

    // Ensure font family is set
    if (!storeDataCopy.fontFamily) {
      storeDataCopy.fontFamily = "sans-serif";
    }

    // Validate and format URLs
    if (storeDataCopy.logoURL && storeDataCopy.logoURL.trim() !== '') {
      // If URL doesn't start with http:// or https://, prepend https://
      if (!storeDataCopy.logoURL.match(/^https?:\/\//)) {
        storeDataCopy.logoURL = `https://${storeDataCopy.logoURL}`;
      }
    } else {
      storeDataCopy.logoURL = ''; // Empty string if no URL
    }

    if (storeDataCopy.bannerURL && storeDataCopy.bannerURL.trim() !== '') {
      // If URL doesn't start with http:// or https://, prepend https://
      if (!storeDataCopy.bannerURL.match(/^https?:\/\//)) {
        storeDataCopy.bannerURL = `https://${storeDataCopy.bannerURL}`;
      }
    } else {
      storeDataCopy.bannerURL = ''; // Empty string if no URL
    }

    // Serialize componentVisibility if it exists
    if (!storeDataCopy.componentVisibility || Object.keys(storeDataCopy.componentVisibility).length === 0) {
      // Set default component visibility if missing
      storeDataCopy.componentVisibility = JSON.stringify(DEFAULT_VISIBILITY);
    } else if (typeof storeDataCopy.componentVisibility !== 'string') {
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
    // Use the base apiUrl for the store controller, assuming categories are related or use a dedicated category service URL if available.
    // If categories are under a different controller (e.g., /api/category), adjust accordingly.
    // For now, assuming they are under /api/store/categories or similar - needs verification with backend routes.
    // Using environment.apiUrl directly to ensure /api/ prefix:
    return this.http.get<any[]>(`${environment.apiUrl}/api/categories`); // Ensure correct controller path
  }

  getRandomItemIdsByStore(storeId: number): Observable<number[]> {
    // Use environment.apiUrl instead of hardcoding
    const url = `${environment.apiUrl}/api/Categories/GetItemIdsByStore`; // Construct URL with environment variable
    return this.http.post<number[]>(url, storeId, {
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

    //TODO NEED TO ADD THIS
    const token = this.cookieService.get('auth_token');
    if (!token) return new Observable(observer => observer.error('No token found'));
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Send update to backend
    return this.http.put<StoreDetails>(`${this.apiUrl}/update`, store, { headers }).pipe( // Add headers to request
      map(response => this.deserializeStore(response)),
      tap(updatedStore => {
        // Update the BehaviorSubject with the response from the server
        this.activeStoreSubject.next(updatedStore);
      }),
      catchError(error => {
        console.error('Error updating store', error);
        // Show the actual backend error message
        if (error.error) {
          console.error('Backend Error Details:', error.error);
        }
        return throwError(() => new Error('Failed to update store configuration.'));
      })
    );
  }

  // Save theme settings to the backend
  saveThemeSettings(themeData: {
    theme_1: string,
    theme_2: string,
    theme_3: string,
    fontColor: string,
    fontFamily: string
  }): Observable<StoreDetails> {
    const token = this.cookieService.get('auth_token');
    if (!token) {
      console.error('Authentication token not found. Cannot save theme settings.');
      return throwError(() => new Error('Authentication required.'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<StoreDetails>(`${this.apiUrl}/theme`, themeData, { headers }).pipe(
      tap(updatedStore => {
        // Update the active store with the new theme settings
        const currentStore = this.activeStoreSubject.value;
        const updatedStoreDetails = {
          ...currentStore,
          theme_1: updatedStore.theme_1,
          theme_2: updatedStore.theme_2,
          theme_3: updatedStore.theme_3,
          fontColor: updatedStore.fontColor,
          fontFamily: updatedStore.fontFamily
        };
        this.activeStoreSubject.next(this.deserializeStore(updatedStoreDetails));
      }),
      catchError(error => {
        console.error('Error saving theme settings:', error);
        return throwError(() => new Error('Failed to save theme settings.'));
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

  getStoreById(id: string) {
    return this.getCurrentUserStore();
  }

  getAvailableComponents() {
    return this.http.get<any[]>(`${this.apiUrl}/components`);
  }

  // Check URL availability
  checkUrlAvailability(url: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-url/${url}`).pipe(
      catchError(error => {
        console.error('Error checking URL availability:', error);
        return of(false); // Assume URL is not available in case of error
      })
    );
  }
}
