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
import { ProductManagementComponent } from '../product-management/product-management.component';
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
    ProductManagementComponent,
    RouterLink
  ],
  templateUrl: './store-editor.component.html',
  styles: [`
    .editor-container {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
      font-family: var(--main-font-fam);
    }
    
    .editor-header {
      margin-bottom: 24px;
    }
    
    .editor-header h2 {
      font-size: 1.75rem;
      color: var(--main-color);
      margin: 0 0 6px 0;
      font-family: var(--main-font-fam);
    }
    
    .description {
      color: var(--main-color);
      font-size: 0.95rem;
      opacity: 0.8;
    }
    
    .editor-content {
      display: flex;
      gap: 32px;
      overflow: hidden;
    }
    
    .component-panel {
      width: 35%;
      min-width: 360px;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      background-color: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    
    .component-panel h3 {
      font-size: 1.1rem;
      color: var(--main-color);
      margin: 0 0 12px 0;
    }
    
    .panel-description {
      color: var(--main-color);
      font-size: 0.9rem;
      opacity: 0.7;
      margin-bottom: 16px;
    }
    
    .component-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .component-item {
      background-color: var(--third-color);
      border-radius: 6px;
      padding: 12px 16px;
      transition: all 0.2s;
    }
    
    .component-item:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    .component-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    
    .component-name {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--main-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 22px;
      flex-shrink: 0;
    }
    
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
    }
    
    .slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
    }
    
    input:checked + .slider {
      background-color: var(--second-color);
    }
    
    input:focus + .slider {
      box-shadow: 0 0 1px var(--second-color);
    }
    
    input:checked + .slider:before {
      transform: translateX(18px);
    }
    
    .slider.round {
      border-radius: 34px;
    }
    
    .slider.round:before {
      border-radius: 50%;
    }
    
    .preview-panel {
      flex: 1;
      min-width: 0;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 600px;
    }
    
    .preview-panel h3 {
      font-size: 1.1rem;
      color: var(--main-color);
      margin: 0 0 8px 0;
      padding: 16px 16px 0 16px;
    }
    
    .preview-panel .panel-description {
      padding: 0 16px;
    }
    
    .preview-frame-wrapper {
      flex: 1;
      background-color: var(--third-color);
      border-radius: 0 0 8px 8px;
      overflow: hidden;
      position: relative;
      min-height: 500px;
    }
    
    app-store-preview {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 500px;
    }
    
    .actions {
      margin-top: auto;
      padding-top: 24px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    
    .standard-form-group {
      margin-bottom: 16px;
    }
    
    .standard-form-group label {
      display: block;
      margin-bottom: 6px;
      font-size: 0.9rem;
      color: var(--main-color);
    }
    
    .standard-form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.9rem;
      font-family: var(--main-font-fam);
    }
    
    .text-danger {
      color: #dc3545;
      font-size: 0.8rem;
      margin-top: 4px;
    }
    
    .tabs {
      display: flex;
      border-bottom: 1px solid #ddd;
      margin-bottom: 16px;
    }
    
    .tab {
      padding: 8px 16px;
      cursor: pointer;
      color: var(--main-color);
      font-size: 0.9rem;
      border-bottom: 2px solid transparent;
    }
    
    .tab.active {
      border-bottom-color: var(--second-color);
      font-weight: 500;
    }
    
    .tab-content {
      min-height: 300px;
    }
    
    .theme-preview {
      margin-top: 20px;
    }
    
    @media (min-width: 1440px) {
      .themes-container {
        padding: 32px;
      }
      
      .component-panel {
        gap: 32px;
      }
      
      .preview-panel {
        min-height: 700px;
      }
      
      .preview-frame-wrapper {
        min-height: 600px;
      }
    }
  `]
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
    
    // Get current store details
    this.storeSubscription = this.storeService.activeStore$.subscribe(store => {
      if (store) {
        this.store = store;
        // If store ID is 0, it means this is initial setup
        this.isInitialSetup = !store.id;
        
        // Update component selection based on stored visibility
        this.updateComponentSelectionFromStore();
        
        this.isLoading = false;
        this.loadingService.setIsLoading(false);
      } else {
        // No store found, handle initial setup
        this.initializeFallbackStore();
        this.isLoading = false;
        this.loadingService.setIsLoading(false);
      }
    });
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
    // This will be automatically handled by Angular's change detection
    // as the inputs to the StorePreviewComponent will be updated
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
          
          // Handle specific errors
          if (error.message.includes('URL already exists')) {
            this.formErrors['url'] = 'This URL is already taken. Please choose another one.';
            this.activeTab = 'basic';
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
          
          // Handle specific errors
          if (error.message.includes('URL already exists')) {
            this.formErrors['url'] = 'This URL is already taken. Please choose another one.';
            this.activeTab = 'basic';
          }
        }
      });
    }
  }
  
  // Method to navigate to the store's public page
  viewStore() {
    if (this.store && this.store.url) {
      window.open(`/${this.store.url}`, '_blank');
    }
  }
} 