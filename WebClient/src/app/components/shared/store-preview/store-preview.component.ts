import { Component, Input } from '@angular/core';
import { StoreTheme } from '../../../models/store-theme.model';
import { StoreDetails } from '../../../models/store-details';
import { CommonModule } from '@angular/common';
import { ItemCardComponent } from '../../item-card/item-card.component';

@Component({
  selector: 'app-store-preview',
  standalone: true,
  imports: [CommonModule, ItemCardComponent],
  templateUrl: './store-preview.component.html',
  styleUrls: ['./store-preview.component.css']
})
export class StorePreviewComponent {
  @Input() theme: StoreTheme | null = null;
  @Input() selectedComponents: string[] | null = null;
  @Input() storeData: StoreDetails | null = null;

  // Display a limited number of sample items
  displayCount: number = 3;

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

  // Helper method to get sample item IDs
  getSampleItemIds(): number[] {
    // Return sample item IDs for preview purposes
    return [1, 2, 3]; // Always use sample IDs for preview
  }
} 