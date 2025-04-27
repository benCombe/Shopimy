/*
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { StoreDetails } from '../../models/store-details';
import { ThemesComponent } from '../store-owner-layout/themes/themes.component';
import { Subscription } from 'rxjs';
import { ComponentVisibility, DEFAULT_VISIBILITY } from '../../models/component-visibility.model';
import { StoreTheme } from '../../models/store-theme.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-store-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemesComponent, RouterLink],
  templateUrl: './store-editor.component.html',
  styleUrl: './store-editor.component.css'
})
export class StoreEditorComponent implements OnInit, OnDestroy {
  store: StoreDetails | null = null;
  isCreateMode = false;
  activeSection = 'basic-info';
  private subscription = new Subscription();
  
  // URL validation
  isUrlValid = true;
  isUrlAvailable = true;
  isCheckingUrl = false;
  urlErrorMessage = '';
  
  // Store name validation
  isNameValid = true;
  nameErrorMessage = '';
  
  // Loading and error states
  isLoading = false;
  errorMessage = '';
  showSuccessMessage = false;
  
  // Debounce URL checking
  private urlDebounce = new Subject<string>();
  
  // Example structure for managing component visibility selection
  availableComponents = [
    { name: 'header', label: 'Header', isSelected: true },
    { name: 'hero', label: 'Hero Banner', isSelected: true },
    { name: 'featured', label: 'Featured Products', isSelected: true },
    { name: 'categories', label: 'Category List', isSelected: true },
    { name: 'testimonials', label: 'Testimonials', isSelected: true },
    { name: 'newsletter', label: 'Newsletter Signup', isSelected: true },
    { name: 'footer', label: 'Footer', isSelected: true },
  ];

  constructor(
    private storeService: StoreService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check if we're creating a new store or editing an existing one
    // If activeStore$ returns null, we're in create mode
    this.subscription.add(
      this.storeService.activeStore$.subscribe((store: StoreDetails | null) => {
        if (store) {
          this.store = store;
          this.isCreateMode = false;
          // Initialize isSelected based on the new store's default visibility
          this.updateAvailableComponentsFromStore();
        } else {
          this.isCreateMode = true;
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
          // Initialize isSelected based on the new store's default visibility
          this.updateAvailableComponentsFromStore();
        }
      })
    );
    
    // Set up URL validation with debounce
    this.subscription.add(
      this.urlDebounce.pipe(
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(url => {
        this.validateUrl(url);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  // Validate store URL format
  validateStoreUrl(): boolean {
    if (!this.store) return false;
    
    // URL cannot be empty
    if (!this.store.url) {
      this.isUrlValid = false;
      this.urlErrorMessage = 'URL cannot be empty';
      return false;
    }
    
    // Ensure URL follows valid format (letters, numbers, hyphens only)
    const urlPattern = /^[a-zA-Z0-9\\-]+$/;
    this.isUrlValid = urlPattern.test(this.store.url);
    
    if (!this.isUrlValid) {
      this.urlErrorMessage = 'URL can only contain letters, numbers, and hyphens.';
      return false;
    }
    
    return true;
  }
  
  // Check if URL is available (not taken)
  checkUrlAvailability(): void {
    if (!this.store?.url || !this.validateStoreUrl()) return;
    
    this.isCheckingUrl = true;
    this.storeService.checkUrlAvailability(this.store.url).subscribe({
      next: (isAvailable) => {
        this.isUrlAvailable = isAvailable;
        this.isCheckingUrl = false;
        if (!isAvailable) {
          this.urlErrorMessage = 'This URL is already taken. Please choose another.';
        }
      },
      error: (err) => {
        console.error('Error checking URL availability', err);
        this.isCheckingUrl = false;
        this.urlErrorMessage = 'Error checking URL availability. Please try again.';
      }
    });
  }
  
  // Combined URL validation on change
  onUrlChange(url: string): void {
    if (!url) {
      this.isUrlValid = false;
      this.urlErrorMessage = 'URL cannot be empty';
      return;
    }
    
    // Queue URL validation for debounce
    this.urlDebounce.next(url);
  }
  
  // Perform URL validation and availability check
  private validateUrl(url: string): void {
    if (this.validateStoreUrl()) {
      this.checkUrlAvailability();
    }
  }
  
  // Validate store name
  validateStoreName(): boolean {
    if (!this.store) return false;
    
    if (!this.store.name) {
      this.isNameValid = false;
      this.nameErrorMessage = 'Store name cannot be empty';
      return false;
    }
    
    if (this.store.name.length > 100) {
      this.isNameValid = false;
      this.nameErrorMessage = 'Store name cannot exceed 100 characters';
      return false;
    }
    
    this.isNameValid = true;
    return true;
  }

  // New method to update component visibility based on checkbox states
  updateComponentVisibility(): void {
    if (!this.store) return;

    const newVisibility: ComponentVisibility = { ...DEFAULT_VISIBILITY }; // Start with defaults
    this.availableComponents.forEach(comp => {
      if (newVisibility.hasOwnProperty(comp.name)) {
        (newVisibility as any)[comp.name] = comp.isSelected;
      }
    });
    this.store.componentVisibility = newVisibility;
    console.log('Updated component visibility:', this.store.componentVisibility);
  }

  // Helper to sync checkbox states FROM the store data (e.g., on init)
  updateAvailableComponentsFromStore(): void {
    if (!this.store) return;
    this.availableComponents.forEach(comp => {
      if (this.store!.componentVisibility.hasOwnProperty(comp.name)) {
        comp.isSelected = (this.store!.componentVisibility as any)[comp.name];
      }
    });
  }

  saveStore(): void {
    if (!this.store) return;
    
    // Validate all required fields
    if (!this.validateStoreName() || !this.validateStoreUrl()) {
      return;
    }
    
    // Ensure component visibility is updated before saving
    this.updateComponentVisibility(); 
    
    // Theme properties should already be updated via updateStoreTheme event
    this.isLoading = true;
    this.errorMessage = '';
    
    if (this.isCreateMode) {
      this.storeService.createStore(this.store).subscribe({
        next: (createdStore) => {
          console.log('Store created successfully', createdStore);
          this.isLoading = false;
          this.showSuccessMessage = true;
          // Wait a short time to show success message before redirecting
          setTimeout(() => {
            this.router.navigate(['/store-owner']);
          }, 1500);
        },
        error: (error) => {
          console.error('Error creating store', error);
          this.isLoading = false;
          this.errorMessage = error.error || 'Error creating store. Please try again.';
        }
      });
    } else {
      // Update existing store
      this.storeService.updateStore(this.store).subscribe({
        next: (updatedStore) => {
          console.log('Store updated successfully', updatedStore);
          this.isLoading = false;
          this.showSuccessMessage = true;
          // Wait a short time to show success message before redirecting
          setTimeout(() => {
            this.router.navigate(['/store-owner']);
          }, 1500);
        },
        error: (error) => {
          console.error('Error updating store', error);
          this.isLoading = false;
          this.errorMessage = error.error || 'Error updating store. Please try again.';
        }
      });
    }
  }

  // Method to handle theme updates from the ThemesComponent
  updateStoreTheme(theme: StoreTheme): void {
    if (!this.store) return;
    this.store.primaryColor = theme.primaryColor;
    this.store.secondaryColor = theme.secondaryColor;
    this.store.backgroundColor = theme.backgroundColor;
    this.store.textColor = theme.textColor;
    this.store.fontFamily = theme.fontFamily;
  }
}
*/ 