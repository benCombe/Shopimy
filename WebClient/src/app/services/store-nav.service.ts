import { StoreService } from './store.service';
import { Injectable } from '@angular/core';
import { StoreDetails } from '../models/store-details';
import { BehaviorSubject, filter, map } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StoreNavService {

  ActiveStore: StoreDetails | null = null;

  private currentUrlSubject = new BehaviorSubject<string>('');
  currentUrl$ = this.currentUrlSubject.asObservable();

  constructor(
    private storeService: StoreService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute
  ) {
    // Subscribe to ActiveStore$
    this.storeService.activeStore$.subscribe(store => {
      this.ActiveStore = store;
    });

    // Listen for router navigation changes and update currentUrl
  }


  // Initialize method to set the initial state
  initialize(): void {
    const storeUrl = this.router.url.split('/')[1]; // Get the store URL segment
    this.currentUrlSubject.next(storeUrl); // Set initial URL to store-url

    // Listen for router navigation changes and update currentUrl
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map((event: any) => event.urlAfterRedirects.replace(/^\//, '')) // Remove leading slash
      )
      .subscribe(newUrl => {
        console.log("STORENAV: " + newUrl);
        this.currentUrlSubject.next(newUrl);
      });

    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
      const newUrl = this.router.url.split('/')[1]; // Get the store URL segment
      this.currentUrlSubject.next(newUrl);
    });
  }


  // Method to change the view based on the URL
  changeView(view: string): void {
    const baseUrl = this.router.url.split('/')[1]; // Get store URL segment
    const newUrl = `${baseUrl}/${view}`;
    this.router.navigateByUrl(newUrl);
  }

  // Method to navigate to the store home page (store-url)
  toStoreHome(): void {
    if (this.ActiveStore && this.ActiveStore.url) {
      const storeUrl = this.ActiveStore.url;
      const newUrl = `/${storeUrl}`; // Set the new URL to mysite.com/store-url
      this.router.navigateByUrl(newUrl);
    } else {
      console.error('Active store URL not found');
    }
  }

}
