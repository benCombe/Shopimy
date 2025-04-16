import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { Subscription } from 'rxjs';
import { StoreService } from '../../../services/store.service';
import { StoreDetails } from '../../../models/store-details';
import { StoreTheme } from '../../../models/store-theme.model';
import { StorePreviewComponent } from '../../shared/store-preview/store-preview.component';

@Component({
  selector: 'app-store-editor',
  standalone: true,
  imports: [
    NgFor,
    FormsModule,
    StorePreviewComponent
  ],
  templateUrl: './store-editor.component.html',
  styleUrl: './store-editor.component.css'
})
export class StoreEditorComponent implements OnInit, OnDestroy {
  user: User | null | undefined;
  store: StoreDetails | null = null;
  private userSubscription: Subscription | undefined;
  private storeSubscription: Subscription | undefined;
  
  // Initial component state
  availableComponents = [
    { id: 'header', name: 'Header', isSelected: true },
    { id: 'hero', name: 'Hero Banner', isSelected: true },
    { id: 'featured', name: 'Featured Products', isSelected: true },
    { id: 'categories', name: 'Category Showcase', isSelected: false },
    { id: 'testimonials', name: 'Testimonials', isSelected: false },
    { id: 'newsletter', name: 'Newsletter Signup', isSelected: false },
    { id: 'footer', name: 'Footer', isSelected: true }
  ];

  constructor(
    private userService: UserService,
    private storeService: StoreService
  ) {}

  ngOnInit() {
    this.userSubscription = this.userService.activeUser$.subscribe(u => {
      this.user = u;
    });
    
    // Subscribe to the active store
    this.storeSubscription = this.storeService.activeStore$.subscribe(store => {
      if (store) {
        this.store = store;
        this.updateComponentSelection();
      } else {
        // Create a fallback store if none is returned
        this.initializeFallbackStore();
      }
    });
  }

  initializeFallbackStore() {
    // Create a default store if none is loaded
    this.store = {
      id: 0,
      name: 'Default Store',
      url: '',
      theme_1: '#393727',
      theme_2: '#D0933D',
      theme_3: '#D3CEBB',
      fontColor: '#333333',
      fontFamily: '"Inria Serif", serif',
      bannerText: 'Welcome to our store',
      logoText: 'Store',
      logoURL: '',
      bannerURL: '',
      categories: []
    };
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.storeSubscription) {
      this.storeSubscription.unsubscribe();
    }
  }

  updateComponentSelection() {
    // TODO: Update component selection based on store settings
    // For now, just using the default selection
  }

  toggleComponent(component: any) {
    component.isSelected = !component.isSelected;
    this.updatePreview(); // Update preview on change
  }

  updatePreview() {
    console.log("Component selection changed, preview will update.");
  }

  getSelectedComponentIds(): string[] {
    return this.availableComponents
      .filter(c => c.isSelected)
      .map(c => c.id);
  }

  getCurrentTheme(): StoreTheme | null {
    if (!this.store) {
      return {
        mainColor: '#393727',
        secondColor: '#D0933D',
        thirdColor: '#D3CEBB',
        altColor: '#d5d5d5',
        mainFontFam: '"Inria Serif", serif'
      };
    }
    
    return {
      mainColor: this.store.theme_1 || '#393727',
      secondColor: this.store.theme_2 || '#D0933D',
      thirdColor: this.store.theme_3 || '#D3CEBB',
      altColor: this.store.fontColor || '#d5d5d5',
      mainFontFam: this.store.fontFamily || '"Inria Serif", serif'
    };
  }

  saveChanges() {
    if (!this.store) return;
    
    // Get selected components
    const selectedComponents = this.getSelectedComponentIds();
    
    // Save the store with updated component configuration
    // For now, just log the information
    console.log('Saving store configuration:', {
      storeId: this.store.id,
      storeName: this.store.name,
      selectedComponents: selectedComponents
    });
    
    // In a real implementation, you would update the store with the component selection
    // and then save it using the store service
    // For example:
    // this.store.componentConfig = JSON.stringify(selectedComponents);
    // this.storeService.updateStore(this.store).subscribe({
    //   next: () => console.log('Store saved successfully'),
    //   error: (err) => console.error('Error saving store', err)
    // });
    
    // Show a success message
    alert('Store configuration saved successfully!');
  }
} 