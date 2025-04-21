import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { StoreTheme } from '../../../models/store-theme.model';
import { StoreDetails } from '../../../models/store-details';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-store-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store-preview.component.html',
  styleUrls: ['./store-preview.component.css']
})
export class StorePreviewComponent implements OnChanges {
  @Input() theme: StoreTheme | null = null;
  @Input() selectedComponents: string[] | null = null;
  @Input() storeData: StoreDetails | null = null;

  // Display a limited number of sample items
  displayCount: number = 3;
  
  // Flag to track preview readiness
  previewReady: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    // When any input changes, update the preview
    if (changes['storeData'] || changes['selectedComponents'] || changes['theme']) {
      this.updatePreview();
    }
  }

  updatePreview(): void {
    // Verify we have the essential data for a proper preview
    this.previewReady = !!this.storeData && 
                         !!this.theme &&
                         !!this.selectedComponents;
    
    // Additional logging to help diagnose preview issues
    if (this.previewReady) {
      console.log('Preview updated with:', {
        store: this.storeData?.name,
        url: this.storeData?.url,
        components: this.selectedComponents,
        theme: this.theme
      });
    }
  }

  isComponentSelected(componentId: string): boolean {
    // If no components are selected, show all components
    if (!this.selectedComponents || this.selectedComponents.length === 0) {
      return true;
    }
    // Check if the component ID exists in the selectedComponents array
    return this.selectedComponents.includes(componentId);
  }

  getThemeStyles(): { [key: string]: string } {
    if (!this.theme) return {};

    return {
      '--preview-main-color': this.theme.mainColor || '#393727',
      '--preview-second-color': this.theme.secondColor || '#D0933D',
      '--preview-third-color': this.theme.thirdColor || '#D3CEBB',
      '--preview-alt-color': this.theme.altColor || '#333333',
      '--preview-font-family': this.theme.mainFontFam || 'sans-serif'
    };
  }

  // Helper method to get sample item IDs - These represent actual products
  getSampleItemIds(): number[] {
    // Return sample item IDs for preview purposes
    return [1, 2, 3]; // Always use sample IDs for preview
  }
  
  // Helper to check if preview is in a stable state
  isPreviewStable(): boolean {
    return this.previewReady && 
           !!this.storeData?.name && 
           !!this.storeData?.url;
  }
  
  // Get the actual URL where the store will be accessible
  getPublicStoreUrl(): string {
    if (!this.storeData?.url) return '';
    return `/${this.storeData.url}`;
  }
} 