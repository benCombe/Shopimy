import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { Subscription } from 'rxjs';
import { StoreService } from '../../../services/store.service';
import { StoreDetails } from '../../../models/store-details';
import { StoreTheme } from '../../../models/store-theme.model';
import { StorePreviewComponent } from '../../shared/store-preview/store-preview.component';
import { ComponentVisibility, DEFAULT_VISIBILITY } from '../../../models/component-visibility.model';
import { ThemesComponent } from '../themes/themes.component';
import { LoadingService } from '../../../services/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-store-editor',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    StorePreviewComponent,
    ThemesComponent,
    RouterLink
  ],
  templateUrl: './store-editor.component.html',
  styleUrls: ['./store-editor.component.css']
})
export class StoreEditorComponent implements OnInit, OnDestroy {
  @ViewChild('storeForm') storeForm!: NgForm;
  @ViewChild(ThemesComponent) themesComponent!: ThemesComponent;
  
  user: User | null | undefined;
  store: StoreDetails | null = null;
  private userSubscription: Subscription | undefined;
  private storeSubscription: Subscription | undefined;
  
  activeTab: string = 'basic'; // basic, theme, components, products
  isInitialSetup: boolean = false;
  isLoading: boolean = true;
  formErrors: { [key: string]: string } = {};
  saveError: string | null = null;
  
  availableComponents = [
    { id: 'header', name: 'Header & Navigation', isSelected: true },
    { id: 'hero', name: 'Hero Banner', isSelected: true },
    { id: 'featured', name: 'Featured Products', isSelected: true },
    { id: 'categories', name: 'Categories', isSelected: true },
    { id: 'testimonials', name: 'Testimonials', isSelected: true },
    { id: 'newsletter', name: 'Newsletter Signup', isSelected: true },
    { id: 'footer', name: 'Footer', isSelected: true }
  ];

  constructor(
    private userService: UserService,
    private storeService: StoreService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadingService.setIsLoading(true);
    this.isLoading = true;
    
    // Get current user
    this.userSubscription = this.userService.activeUser$.subscribe(user => {
      this.user = user;
    });
    
    // Force reload store data directly from the backend instead of relying on activeStore$
    this.storeService.getCurrentUserStore().subscribe(
      (store: StoreDetails) => {
        console.log("Store editor received store directly from backend:", store);
        
        if (store && store.id > 0) {
          // We have a valid store with ID
          this.store = store;
          this.isInitialSetup = false;
          console.log("Setting store and isInitialSetup=false because ID exists:", store.id);
          
          // Update component selection based on stored visibility
          this.updateComponentSelectionFromStore();
        } else {
          // No valid store found, handle initial setup
          console.log("No valid store found in direct backend call, initializing fallback");
          this.initializeFallbackStore();
        }
        
        this.isLoading = false;
        this.loadingService.setIsLoading(false);
      },
      (error: Error) => {
        console.error("Error loading store from backend:", error);
        this.initializeFallbackStore();
        this.isLoading = false;
        this.loadingService.setIsLoading(false);
      }
    );
  }

  updateComponentSelectionFromStore() {
    if (this.store && this.store.componentVisibility) {
      // Update isSelected for each component based on store's componentVisibility
      this.availableComponents.forEach(component => {
        const key = component.id as keyof ComponentVisibility;
        component.isSelected = this.store?.componentVisibility[key] !== false;
      });
    }
  }

  initializeFallbackStore() {
    // Create a fallback store for initial setup with empty data
    this.store = new StoreDetails(
      0, 
      '', 
      '', 
      '#393727', 
      '#D0933D', 
      '#D3CEBB', 
      '#333333', 
      'sans-serif', 
      'Welcome to our store', 
      '', 
      '', 
      '', 
      [],
      DEFAULT_VISIBILITY
    );
    this.isInitialSetup = true;
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.storeSubscription) {
      this.storeSubscription.unsubscribe();
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    
    // If switching to components tab, make sure component visibility is updated
    if (tab === 'components') {
      this.updateComponentSelectionFromStore();
    }
  }

  toggleComponent(component: any) {
    component.isSelected = !component.isSelected;
    this.updateComponentVisibility();
    this.updatePreview();
  }
  
  updateComponentVisibility() {
    if (!this.store) return;
    
    // Update the store's component visibility based on selected components
    const visibility: ComponentVisibility = { ...DEFAULT_VISIBILITY };
    
    this.availableComponents.forEach(component => {
      const key = component.id as keyof ComponentVisibility;
      visibility[key] = component.isSelected;
    });
    
    this.store.componentVisibility = visibility;
  }

  updatePreview() {
    // Force change detection by creating a new reference for store
    if (this.store) {
      this.store = { ...this.store };
    }
    
    // The change detection will automatically update the preview component
    console.log("Preview updated with components:", this.getSelectedComponentIds());
  }

  getSelectedComponentIds(): string[] {
    return this.availableComponents
      .filter(component => component.isSelected)
      .map(component => component.id);
  }

  getCurrentTheme(): StoreTheme | null {
    if (!this.store) return null;
    
    return {
      mainColor: this.store.theme_1,
      secondColor: this.store.theme_2,
      thirdColor: this.store.theme_3,
      altColor: this.store.fontColor,
      mainFontFam: this.store.fontFamily
    };
  }
  
  updateTheme(theme: StoreTheme) {
    if (!this.store) return;
    
    this.store.theme_1 = theme.mainColor;
    this.store.theme_2 = theme.secondColor;
    this.store.theme_3 = theme.thirdColor;
    this.store.fontColor = theme.altColor;
    this.store.fontFamily = theme.mainFontFam;
    
    // Update preview
    this.updatePreview();
  }
  
  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;
    
    // Check store name
    if (!this.store?.name) {
      this.formErrors['name'] = 'Store name is required';
      isValid = false;
    }
    
    // Check store URL
    if (!this.store?.url) {
      this.formErrors['url'] = 'Store URL is required';
      isValid = false;
    } else if (!/^[a-z0-9-]+$/.test(this.store.url)) {
      this.formErrors['url'] = 'URL can only contain lowercase letters, numbers, and hyphens';
      isValid = false;
    }
    
    return isValid;
  }

  saveChanges() {
    this.saveError = null;
    if (!this.validateForm()) {
      // Show appropriate tab with errors
      if (this.formErrors['name'] || this.formErrors['url']) {
        this.activeTab = 'basic';
      }
      return;
    }
    
    this.loadingService.setIsLoading(true);
    
    // Make sure visibility is properly updated
    this.updateComponentVisibility();
    
    // Ensure store data is valid before sending
    this.sanitizeStoreData();
    
    if (this.isInitialSetup) {
      // Create new store
      this.storeService.createStore(this.store!).subscribe({
        next: (createdStore) => {
          this.store = createdStore;
          this.isInitialSetup = false;
          this.loadingService.setIsLoading(false);
          
          // Navigate to products page for further setup
          this.router.navigate(['/dashboard'], { queryParams: { page: 'Products' } });
        },
        error: (error) => {
          console.error('Error creating store:', error);
          this.loadingService.setIsLoading(false);
          this.saveError = error.error?.message || error.message || 'Failed to create store. Please check inputs.';
          
          if (error.error?.message?.includes('URL already exists') || error.message?.includes('URL already exists')) {
            this.formErrors['url'] = 'This URL is already taken. Please choose another one.';
            this.activeTab = 'basic';
            this.saveError = this.formErrors['url'];
          }
        }
      });
    } else {
      // Update existing store
      this.storeService.updateStore(this.store!).subscribe({
        next: (updatedStore) => {
          this.store = updatedStore;
          this.loadingService.setIsLoading(false);
        },
        error: (error) => {
          console.error('Error updating store:', error);
          this.loadingService.setIsLoading(false);
          this.saveError = error.error?.message || error.message || 'Failed to update store. Please check inputs.';
          
          if (error.error?.message?.includes('URL already exists') || error.message?.includes('URL already exists')) {
            this.formErrors['url'] = 'This URL is already taken. Please choose another one.';
            this.activeTab = 'basic';
            this.saveError = this.formErrors['url'];
          }
        }
      });
    }
  }
  
  // Method to navigate to the store's public page
  viewStore() {
    if (!this.store || !this.store.url) {
      this.saveError = 'Please save your store first to view it.';
      return;
    }
    
    // Ensure we have a valid URL
    const storeUrl = this.store.url.trim();
    if (!storeUrl) {
      this.saveError = 'Your store URL is empty. Please set a valid URL and save your store.';
      this.activeTab = 'basic';
      return;
    }
    
    // Open in a new tab
    window.open(`/${storeUrl}`, '_blank');
  }

  // Set correct URL for your store in the preview component
  getCorrectStoreUrl(): string {
    // If this is an existing store with URL use that
    if (this.store && this.store.url && this.store.url !== 'DEFAULT') {
      return this.store.url;
    }
    
    // Fallback to a preview URL
    return 'preview';
  }

  // Helper to ensure store data is valid before saving
  sanitizeStoreData() {
    if (!this.store) return;
    
    // Ensure the ID is preserved
    if (this.store.id <= 0) {
      console.warn("Store ID is missing or invalid, this might cause issues with updates");
    }
    
    // Validate store name
    if (!this.store.name || this.store.name === 'DEFAULT') {
      this.store.name = 'My Store';
    }
    
    // Validate store URL
    if (!this.store.url || this.store.url === 'DEFAULT') {
      this.store.url = 'my-store';
    }
    
    // Validate theme colors
    if (!this.store.theme_1 || !this.store.theme_1.startsWith('#')) {
      this.store.theme_1 = '#393727';
    }
    if (!this.store.theme_2 || !this.store.theme_2.startsWith('#')) {
      this.store.theme_2 = '#D0933D';
    }
    if (!this.store.theme_3 || !this.store.theme_3.startsWith('#')) {
      this.store.theme_3 = '#D3CEBB';
    }
    if (!this.store.fontColor || !this.store.fontColor.startsWith('#')) {
      this.store.fontColor = '#333333';
    }
    
    // Validate font family
    if (!this.store.fontFamily) {
      this.store.fontFamily = 'sans-serif';
    }
    
    // Ensure component visibility is set
    if (!this.store.componentVisibility) {
      this.store.componentVisibility = DEFAULT_VISIBILITY;
    }
    
    console.log("Sanitized store data:", this.store);
  }
} 