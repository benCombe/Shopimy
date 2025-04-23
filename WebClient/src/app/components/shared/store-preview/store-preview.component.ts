import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { StoreTheme } from '../../../models/store-theme.model';
import { StoreDetails } from '../../../models/store-details';
import { CommonModule } from '@angular/common';
import { HeroBannerComponent } from '../hero-banner/hero-banner.component';
import { StoreHeaderComponent } from '../store-header/store-header.component';
import { FeaturedProductsComponent } from '../featured-products/featured-products.component';
import { TestimonialsComponent } from '../testimonials/testimonials.component';
import { NewsletterComponent } from '../newsletter/newsletter.component';

@Component({
  selector: 'app-store-preview',
  standalone: true,
  imports: [
    CommonModule,
    HeroBannerComponent,
    StoreHeaderComponent,
    FeaturedProductsComponent,
    TestimonialsComponent,
    NewsletterComponent
  ],
  templateUrl: './store-preview.component.html',
  styleUrls: ['./store-preview.component.css']
})
export class StorePreviewComponent implements OnChanges {
  @Input() theme: StoreTheme | null = null;
  @Input() selectedComponents: string[] | null = null;
  @Input() storeData: StoreDetails | null = null;
  
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
    const styles: { [key: string]: string } = {
      '--preview-main-color': '#393727',
      '--preview-second-color': '#D0933D', 
      '--preview-third-color': '#D3CEBB',
      '--preview-alt-color': '#333333',
      '--preview-font-family': 'sans-serif'
    };

    if (this.theme) {
      if (this.theme.mainColor) styles['--preview-main-color'] = this.theme.mainColor;
      if (this.theme.secondColor) styles['--preview-second-color'] = this.theme.secondColor;
      if (this.theme.thirdColor) styles['--preview-third-color'] = this.theme.thirdColor;
      if (this.theme.altColor) styles['--preview-alt-color'] = this.theme.altColor;
      if (this.theme.mainFontFam) styles['--preview-font-family'] = this.theme.mainFontFam;
    }
    
    return styles;
  }
  
  // Get the actual URL where the store will be accessible
  getPublicStoreUrl(): string {
    if (!this.storeData?.url) return '';
    return `/${this.storeData.url}`;
  }
} 