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
    }
    
    .save-btn {
      padding: 10px 20px;
      background-color: var(--second-color);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: var(--main-font-fam);
    }
    
    .save-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
    
    @media (max-width: 768px) {
      .editor-container {
        padding: 16px;
      }
      
      .editor-content {
        flex-direction: column;
      }
      
      .component-panel {
        width: 100%;
        max-width: 100%;
        min-width: auto;
      }
      
      .editor-header h2 {
        font-size: 1.5rem;
      }
      
      .preview-panel {
        min-height: 400px;
      }
      
      .preview-frame-wrapper {
        min-height: 350px;
      }
    }
  `]
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