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
import { StoreTheme } from '../models/store-theme.model';

// Define an interface for API serialization that extends StoreDetails
interface StoreDetailsForApi extends Omit<StoreDetails, 'componentVisibility'> {
  componentVisibility: string;
}

interface Response {
  details: StoreDetails;
  categories: Category[];
}

// Default theme constants
export const DEFAULT_THEME: StoreTheme = {
  mainColor: '#393727',
  secondColor: '#D0933D',
  thirdColor: '#D3CEBB',
  altColor: '#FFFFFF',
  mainFontFam: 'Cambria, Cochin'
};

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private apiUrl = `${environment.apiUrl}/api/store`;

  // Base URLs for items and categories endpoints.
  // These seem unused, potentially remove later if confirmed.
  // private itemBaseUrl = '/api/items';
  // private categoryBaseUrl = '/api/categories';

  activeStoreSubject: BehaviorSubject<StoreDetails> = new BehaviorSubject<StoreDetails>(
    new StoreDetails(
      0, "DEFAULT", "DEFAULT", 
      DEFAULT_THEME.mainColor, 
      DEFAULT_THEME.secondColor, 
      DEFAULT_THEME.thirdColor, 
      DEFAULT_THEME.altColor, 
      DEFAULT_THEME.mainFontFam, 
      "BANNER TEXT", "LOGO TEXT", "", "", []
    )
  );
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
          return new StoreDetails(
            0, '', '', 
            DEFAULT_THEME.mainColor, 
            DEFAULT_THEME.secondColor, 
            DEFAULT_THEME.thirdColor, 
            DEFAULT_THEME.altColor, 
            DEFAULT_THEME.mainFontFam, 
            '', '', '', '', [], DEFAULT_VISIBILITY
          );
        }
      }),
      tap(store => {
        console.log("Setting active store after deserialization:", store);
        this.activeStoreSubject.next(store);
      }),
      catchError(error => {
        if (error.status === 404) {
          // Special handling for 404 - user doesn't have a store yet
          console.log('User has no store yet, returning empty store details');
          const emptyStore = new StoreDetails(
            0, '', '', 
            DEFAULT_THEME.mainColor, 
            DEFAULT_THEME.secondColor, 
            DEFAULT_THEME.thirdColor, 
            DEFAULT_THEME.altColor, 
            DEFAULT_THEME.mainFontFam, 
            '', '', '', '', [], DEFAULT_VISIBILITY
          );
          this.activeStoreSubject.next(emptyStore);
          return of(emptyStore);
        }
        console.error('Error fetching current user store', error);
        return throwError(() => new Error('Failed to fetch current user store.'));
      })
    );
  }

  // Active getStoreDetails method: maps the response to a new StoreDetails instance.
  getStoreDetails(url: string): Observable<StoreDetails> {
    // Check if url is valid and not a reserved word
    if (!url || url.trim() === '') {
      console.error('Invalid store URL provided:', url);
      this.router.navigate(['/404']);
      return throwError(() => new Error('Invalid store URL.'));
    }

    // Ensure the URL is properly formatted
    const storeUrl = encodeURIComponent(url.trim());
    return this.http.get<StoreDetails>(`${this.apiUrl}/${storeUrl}`).pipe(
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

    // Function to validate and fix color formats
    const validateAndFixColor = (color: string | undefined, defaultColor: string): string => {
      // If color is missing, use default
      if (!color) return defaultColor;
      
      // If doesn't start with #, add it
      if (!color.startsWith('#')) {
        color = '#' + color;
      }
      
      // Check if it's a valid hex color with either 3 or 6 digits
      const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
      if (!isValidHex) {
        console.warn(`Invalid color format detected: ${color}, using default: ${defaultColor}`);
        return defaultColor;
      }
      
      // If it's a 3-digit hex, convert to 6-digit format for consistency
      if (color.length === 4) {
        const r = color[1];
        const g = color[2];
        const b = color[3];
        color = `#${r}${r}${g}${g}${b}${b}`;
      }
      
      return color;
    };

    // Validate and fix all color values
    storeDataCopy.theme_1 = validateAndFixColor(storeDataCopy.theme_1, DEFAULT_THEME.mainColor);
    storeDataCopy.theme_2 = validateAndFixColor(storeDataCopy.theme_2, DEFAULT_THEME.secondColor);
    storeDataCopy.theme_3 = validateAndFixColor(storeDataCopy.theme_3, DEFAULT_THEME.thirdColor);
    storeDataCopy.fontColor = validateAndFixColor(storeDataCopy.fontColor, DEFAULT_THEME.altColor);

    // Ensure font family is set
    if (!storeDataCopy.fontFamily) {
      storeDataCopy.fontFamily = DEFAULT_THEME.mainFontFam;
    }

    // Validate and format URLs
    if (storeDataCopy.logoURL && storeDataCopy.logoURL.trim() !== '') {
      // If URL starts with '/', it's a relative path, convert to absolute using environment API URL
      if (storeDataCopy.logoURL.startsWith('/')) {
        // Extract base URL (protocol + domain) from environment.apiUrl
        const apiUrlObj = new URL(environment.apiUrl);
        const baseUrl = `${apiUrlObj.protocol}//${apiUrlObj.host}`;
        storeDataCopy.logoURL = `${baseUrl}${storeDataCopy.logoURL}`;
      } else {
        try {
          // Try to create a URL object to validate it
          new URL(storeDataCopy.logoURL);
        } catch (e) {
          // If URL doesn't start with http:// or https://, prepend https://
          if (!storeDataCopy.logoURL.match(/^https?:\/\//)) {
            storeDataCopy.logoURL = `https://${storeDataCopy.logoURL}`;
          }
        }
        
        // Final check - if it's still not a valid URL after our fix attempts, set to empty
        try {
          new URL(storeDataCopy.logoURL);
        } catch (e) {
          console.warn('Invalid logoURL format even after fixing, setting to empty string');
          storeDataCopy.logoURL = '';
        }
      }
    } else {
      storeDataCopy.logoURL = ''; // Empty string if no URL
    }

    if (storeDataCopy.bannerURL && storeDataCopy.bannerURL.trim() !== '') {
      // If URL starts with '/', it's a relative path, convert to absolute using environment API URL
      if (storeDataCopy.bannerURL.startsWith('/')) {
        // Extract base URL (protocol + domain) from environment.apiUrl
        const apiUrlObj = new URL(environment.apiUrl);
        const baseUrl = `${apiUrlObj.protocol}//${apiUrlObj.host}`;
        storeDataCopy.bannerURL = `${baseUrl}${storeDataCopy.bannerURL}`;
      } else {
        try {
          // Try to create a URL object to validate it
          new URL(storeDataCopy.bannerURL);
        } catch (e) {
          // If URL doesn't start with http:// or https://, prepend https://
          if (!storeDataCopy.bannerURL.match(/^https?:\/\//)) {
            storeDataCopy.bannerURL = `https://${storeDataCopy.bannerURL}`;
          }
        }
        
        // Final check - if it's still not a valid URL after our fix attempts, set to empty
        try {
          new URL(storeDataCopy.bannerURL);
        } catch (e) {
          console.warn('Invalid bannerURL format even after fixing, setting to empty string');
          storeDataCopy.bannerURL = '';
        }
      }
    } else {
      storeDataCopy.bannerURL = ''; // Empty string if no URL
    }

    // Serialize componentVisibility if it exists
    if (!storeDataCopy.componentVisibility || Object.keys(storeDataCopy.componentVisibility).length === 0) {
      // Set default component visibility if missing
      storeDataCopy.componentVisibility = JSON.stringify(DEFAULT_VISIBILITY);
    } else if (typeof storeDataCopy.componentVisibility !== 'string') {
      try {
        // Always stringify the object to ensure it's sent as a JSON string
        storeDataCopy.componentVisibility = JSON.stringify(storeDataCopy.componentVisibility);
      } catch (error) {
        console.error('Failed to stringify componentVisibility:', error);
        // Fallback to default if JSON stringify fails
        storeDataCopy.componentVisibility = JSON.stringify(DEFAULT_VISIBILITY);
      }
    } else {
      // If it's already a string, validate it's valid JSON
      try {
        JSON.parse(storeDataCopy.componentVisibility as string);
        // No need to modify, it's already a valid JSON string
      } catch (error) {
        console.error('Invalid JSON string in componentVisibility:', error);
        // Fallback to default if current value isn't valid JSON
        storeDataCopy.componentVisibility = JSON.stringify(DEFAULT_VISIBILITY);
      }
    }

    // Log the prepared data with Component Visibility to help debug
    console.log('ComponentVisibility after preparation:', storeDataCopy.componentVisibility);
    console.log('ComponentVisibility type:', typeof storeDataCopy.componentVisibility);

    return storeDataCopy as StoreDetailsForApi;
  }

  // Helper function to deserialize store data from the API
  private deserializeStore(store: any): StoreDetails {
    if (!store) {
      console.error("Trying to deserialize null or undefined store");
      return new StoreDetails(
        0, '', '', 
        DEFAULT_THEME.mainColor, 
        DEFAULT_THEME.secondColor, 
        DEFAULT_THEME.thirdColor, 
        DEFAULT_THEME.altColor, 
        DEFAULT_THEME.mainFontFam, 
        '', '', '', '', []
      );
    }

    try {
      let componentVisibility: ComponentVisibility = DEFAULT_VISIBILITY;
      
      // Handle component visibility deserialization
      if (store.componentVisibility) {
        if (typeof store.componentVisibility === 'string') {
          try {
            componentVisibility = JSON.parse(store.componentVisibility);
          } catch (error) {
            console.error("Failed to parse componentVisibility JSON:", error);
            componentVisibility = DEFAULT_VISIBILITY;
          }
        } else if (typeof store.componentVisibility === 'object') {
          componentVisibility = store.componentVisibility as ComponentVisibility;
        }
      }

      // Map API response to StoreDetails model
      return new StoreDetails(
        store.id || 0,
        store.url || '',
        store.name || '',
        store.theme_1 || DEFAULT_THEME.mainColor,
        store.theme_2 || DEFAULT_THEME.secondColor,
        store.theme_3 || DEFAULT_THEME.thirdColor,
        store.fontColor || DEFAULT_THEME.altColor,
        store.fontFamily || DEFAULT_THEME.mainFontFam,
        store.bannerText || '',
        store.logoText || '',
        store.bannerURL || '',
        store.logoURL || '',
        store.categories || [],
        componentVisibility,
    
      );
    } catch (error) {
      console.error("Error deserializing store:", error);
      return new StoreDetails(
        0, '', '', 
        DEFAULT_THEME.mainColor, 
        DEFAULT_THEME.secondColor, 
        DEFAULT_THEME.thirdColor, 
        DEFAULT_THEME.altColor, 
        DEFAULT_THEME.mainFontFam, 
        '', '', '', '', []
      );
    }
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
    // Clone the store object to avoid modifying the original
    const storeClone = { ...store };
    
    // Add defensive null/undefined checks for critical properties
    if (!storeClone.id || storeClone.id <= 0) {
      console.error('Invalid store data: Missing or invalid ID', storeClone);
      return throwError(() => new Error('Store data is invalid: Missing store ID'));
    }
    
    if (!storeClone.name) {
      storeClone.name = "My Store"; // Provide default instead of failing
      console.warn('Store name was missing, using default: "My Store"');
    }
    
    if (!storeClone.url) {
      storeClone.url = "my-store"; // Provide default instead of failing
      console.warn('Store URL was missing, using default: "my-store"');
    }
    
    // Ensure componentVisibility is present and valid
    if (!storeClone.componentVisibility) {
      storeClone.componentVisibility = DEFAULT_VISIBILITY;
      console.warn('componentVisibility was missing, using default visibility settings');
    }
    
    // Serialize component visibility if it's an object
    const preparedStore = this.prepareStoreDataForApi(storeClone);
    
    // Log the prepared data for debugging
    console.log('Store payload being sent to server:', JSON.stringify(preparedStore, null, 2));
    
    const token = this.cookieService.get('auth_token');
    if (!token) return throwError(() => new Error('Authentication required. Please log in and try again.'));
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Send update to backend
    return this.http.put<StoreDetails>(`${this.apiUrl}/update`, preparedStore, { headers }).pipe( // Add headers to request
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
          
          // Extract validation errors if available
          if (error.error.errors) {
            const errorMessages = Object.entries(error.error.errors)
              .map(([field, message]) => `${field}: ${message}`)
              .join('; ');
            return throwError(() => new Error(`Validation errors: ${errorMessages}`));
          }
          
          // If there's a title or detail field in the error
          if (error.error.title) {
            return throwError(() => new Error(`${error.error.title} ${error.error.detail || ''}`));
          }
        }
        
        // Generic error if we couldn't extract anything specific
        return throwError(() => new Error('Failed to update store configuration. Please try again.'));
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

  /**
   * Checks if the current user has a valid store
   * @returns Observable<boolean> true if the user has a store with valid ID
   */
  hasStore(): Observable<boolean> {
    return this.getCurrentUserStore().pipe(
      map(store => store && store.id && store.id > 0 ? true : false),
      catchError(() => of(false))
    );
  }

  /**
   * Creates a default store for a user who doesn't have one yet
   * @returns Observable<StoreDetails> The newly created store
   */
  createDefaultStore(): Observable<StoreDetails> {
    // Get username for store URL generation
    const token = this.cookieService.get('auth_token');
    if (!token) {
      return throwError(() => new Error('Authentication required.'));
    }
    
    // Extract username from JWT token for the store URL
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const email = payload.email || '';
      // Create a URL-friendly version of the username from email
      const username = email.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '') || 'mystore';
      
      // Create a default store with username-based URL
      const timestamp = new Date().getTime().toString().slice(-4);
      const defaultStore = new StoreDetails(
        0, // ID will be assigned by the server
        `${username}-${timestamp}`, // URL with timestamp to avoid conflicts
        `${username}'s Store`, // Name
        DEFAULT_THEME.mainColor, // theme_1 (main-color)
        DEFAULT_THEME.secondColor, // theme_2 (second-color)
        DEFAULT_THEME.thirdColor, // theme_3 (third-color)
        DEFAULT_THEME.altColor, // fontColor (color-text-on-surface)
        DEFAULT_THEME.mainFontFam, // fontFamily (main-font-fam)
        'Welcome to My Store', // bannerText
        `${username}'s Store`, // logoText
        '', // bannerURL
        '', // logoURL
        [], // categories
        DEFAULT_VISIBILITY // componentVisibility
      );
      
      return this.createStore(defaultStore);
    } catch (error) {
      console.error('Error parsing token or creating default store:', error);
      return throwError(() => new Error('Failed to create default store.'));
    }
  }

  // Upload store logo
  uploadLogo(file: File): Observable<{ logoURL: string }> {
    const token = this.cookieService.get('auth_token');
    if (!token) {
      console.error('Authentication token not found. Cannot upload logo.');
      return throwError(() => new Error('Authentication required.'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('logo', file);

    return this.http.post<{ logoURL: string }>(`${this.apiUrl}/logo`, formData, { headers }).pipe(
      tap(response => {
        // Update the active store with the new logo URL
        const currentStore = this.activeStoreSubject.value;
        currentStore.logoURL = response.logoURL;
        this.activeStoreSubject.next(currentStore);
      }),
      catchError(error => {
        console.error('Error uploading logo:', error);
        return throwError(() => new Error('Failed to upload logo.'));
      })
    );
  }

  // Remove store logo
  removeLogo(): Observable<any> {
    const token = this.cookieService.get('auth_token');
    if (!token) {
      console.error('Authentication token not found. Cannot remove logo.');
      return throwError(() => new Error('Authentication required.'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete(`${this.apiUrl}/logo`, { headers }).pipe(
      tap(() => {
        // Update the active store by removing the logo URL
        const currentStore = this.activeStoreSubject.value;
        currentStore.logoURL = '';
        this.activeStoreSubject.next(currentStore);
      }),
      catchError(error => {
        console.error('Error removing logo:', error);
        return throwError(() => new Error('Failed to remove logo.'));
      })
    );
  }

  // Update social media links
  updateSocialLinks(socialLinks: {
    facebookLink?: string,
    twitterLink?: string,
    instagramLink?: string,
    linkedInLink?: string
  }): Observable<StoreDetails> {
    const token = this.cookieService.get('auth_token');
    if (!token) {
      console.error('Authentication token not found. Cannot update social links.');
      return throwError(() => new Error('Authentication required.'));
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.put<StoreDetails>(`${this.apiUrl}/social`, socialLinks, { headers }).pipe(
      map(response => this.deserializeStore(response)),
      tap(storeDetails => {
        this.activeStoreSubject.next(storeDetails);
      }),
      catchError(error => {
        console.error('Error updating social links:', error);
        return throwError(() => new Error('Failed to update social links.'));
      })
    );
  }
}
