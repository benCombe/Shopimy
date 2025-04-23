import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../../services/store.service';
import { StoreDetails } from '../../../models/store-details';
import { FormsModule } from '@angular/forms';
import { StoreTheme } from '../../../models/store-theme.model';
import { StorePreviewComponent } from '../../../components/shared/store-preview/store-preview.component';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-themes',
  standalone: true,
  imports: [CommonModule, FormsModule, StorePreviewComponent],
  templateUrl: './themes.component.html',
  styleUrl: './themes.component.css'
})
export class ThemesComponent implements OnInit {
  @Input() currentStore: StoreDetails | null = null;
  @Input() inlineMode: boolean = false; // Used when embedded in store editor
  @Output() themeUpdated = new EventEmitter<StoreTheme>();
  
  // Add missing properties referenced in the template
  isInitialSetup: boolean = false; // Indicates if this is initial store setup
  store: StoreDetails | null = null; // Store data for the preview
  previewDevice: string = 'desktop'; // Current preview device (desktop, tablet, mobile)
  
  themeSwatches = [
    {
      name: 'Earthy Tones',
      mainColor: '#393727',
      secondColor: '#D0933D',
      thirdColor: '#D3CEBB',
      altColor: '#FFFFFF',
      mainFontFam: 'sans-serif'
    },
    {
      name: 'Ocean Blue',
      mainColor: '#23395B',
      secondColor: '#1C77C3',
      thirdColor: '#E5F1F7',
      altColor: '#333333',
      mainFontFam: 'sans-serif'
    },
    {
      name: 'Forest Green',
      mainColor: '#2C4238',
      secondColor: '#557C55',
      thirdColor: '#F2F3EC',
      altColor: '#333333',
      mainFontFam: 'sans-serif'
    },
    {
      name: 'Minimalist Grey',
      mainColor: '#333333',
      secondColor: '#666666',
      thirdColor: '#F5F5F5',
      altColor: '#FFFFFF',
      mainFontFam: 'sans-serif'
    },
    {
      name: 'Vibrant Purple',
      mainColor: '#4B1D5E',
      secondColor: '#E84A5F',
      thirdColor: '#F9F8FC',
      altColor: '#FFFFFF',
      mainFontFam: 'sans-serif'
    },
    {
      name: 'Cozy Cafe',
      mainColor: '#5A412D',
      secondColor: '#BA8554',
      thirdColor: '#F3EEE8',
      altColor: '#333333',
      mainFontFam: 'sans-serif'
    },
    {
      name: 'Hotdog Stand',
      mainColor: '#FF0000',
      secondColor: '#FFFF00',
      thirdColor: '#000000',
      altColor: '#FFFFFF',
      mainFontFam: 'sans-serif'
    }
  ];

  customTheme = {
    name: 'Custom Theme',
    mainColor: '#393727',
    secondColor: '#D0933D',
    thirdColor: '#D3CEBB',
    altColor: '#333333',
    mainFontFam: "'Roboto', sans-serif"
  };

  selectedTheme = 'Earthy Tones';
  activeTab = 'select-theme';
  
  // Add feedback states
  isLoading = false;
  saveSuccess = false;
  saveError = false;
  errorMessage = '';
  successMessage = '';
  errorDetails = ''; // New property for detailed error information

  // Add storeData property to store the active store details
  storeData: StoreDetails | null = null;

  themeChanged: boolean = false;

  constructor(
    private storeService: StoreService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    if (this.currentStore) {
      // Update custom theme from current store values
      this.customTheme.mainColor = this.currentStore.theme_1;
      this.customTheme.secondColor = this.currentStore.theme_2;
      this.customTheme.thirdColor = this.currentStore.theme_3;
      this.customTheme.altColor = this.currentStore.fontColor;
      this.customTheme.mainFontFam = this.currentStore.fontFamily;
      
      // Try to match current theme with a preset
      this.findMatchingTheme();

      // Update RGB CSS variables
      this.updateRgbVariables();
      
      // Set store property for the preview
      this.store = this.currentStore;
    } else {
      // Fetch current active store if not provided
      this.storeService.activeStore$.subscribe(store => {
        if (store) {
          this.currentStore = store;
          this.customTheme.mainColor = store.theme_1;
          this.customTheme.secondColor = store.theme_2;
          this.customTheme.thirdColor = store.theme_3;
          this.customTheme.altColor = store.fontColor;
          this.customTheme.mainFontFam = store.fontFamily;
          
          this.findMatchingTheme();
          
          // Update RGB CSS variables
          this.updateRgbVariables();
          
          // Set store property for the preview
          this.store = store;
          
          // Determine if this is initial setup
          this.isInitialSetup = !store.id || store.id === 0;
        }
      });
    }

    // Initialize with store data if available
    if (this.currentStore) {
      this.initializeFromCurrentStore();
    }
  }

  initializeFromCurrentStore(): void {
    if (!this.currentStore) return;
    
    // Set custom theme from current store values
    this.customTheme = {
      name: 'Custom Theme',
      mainColor: this.currentStore.theme_1 || '#393727',
      secondColor: this.currentStore.theme_2 || '#D0933D',
      thirdColor: this.currentStore.theme_3 || '#D3CEBB',
      altColor: this.currentStore.fontColor || '#333333',
      mainFontFam: this.currentStore.fontFamily || "'Roboto', sans-serif"
    };
    
    // Make sure font family is one of the valid options
    const validFonts = ["'Inria Serif', serif", "'Roboto', sans-serif", "'Open Sans', sans-serif", "'Lato', sans-serif"];
    if (!validFonts.includes(this.customTheme.mainFontFam)) {
      this.customTheme.mainFontFam = "'Roboto', sans-serif";
    }
    
    // Find if current store matches a preset theme
    const matchingTheme = this.themeSwatches.find(theme => 
      theme.mainColor === this.currentStore?.theme_1 &&
      theme.secondColor === this.currentStore?.theme_2 &&
      theme.thirdColor === this.currentStore?.theme_3
    );
    
    this.selectedTheme = matchingTheme ? matchingTheme.name : 'Custom Theme';
  }

  findMatchingTheme() {
    // Try to match current theme with a preset
    const matchingTheme = this.themeSwatches.find(theme => 
      theme.mainColor === this.currentStore?.theme_1 &&
      theme.secondColor === this.currentStore?.theme_2 &&
      theme.thirdColor === this.currentStore?.theme_3
    );
    
    if (matchingTheme) {
      this.selectedTheme = matchingTheme.name;
    } else {
      this.selectedTheme = 'Custom Theme';
    }
  }

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  selectTheme(theme: any) {
    this.selectedTheme = theme.name;
    
    if (theme.name === 'Custom Theme') {
      // Just use the current custom theme
    } else {
      // Copy colors from theme to custom theme
      this.customTheme.mainColor = theme.mainColor;
      this.customTheme.secondColor = theme.secondColor;
      this.customTheme.thirdColor = theme.thirdColor;
      this.customTheme.altColor = theme.altColor;
      this.customTheme.mainFontFam = theme.mainFontFam;
      
      // Update RGB CSS variables for the selected theme
      this.updateRgbVariables();
      
      // Apply theme immediately for preview
      this.applySelectedTheme();
      
      // If in inline mode, emit theme updated event
      if (this.inlineMode) {
        this.emitThemeUpdate();
      }
    }
    
    // Set themeChanged to true when any theme is selected
    this.themeChanged = true;
  }
  
  updateCustomTheme() {
    this.selectedTheme = 'Custom Theme';
    
    // Update RGB CSS variables for the custom theme
    this.updateRgbVariables();
    
    // Apply theme immediately for preview
    this.applySelectedTheme();
    
    // If in inline mode, emit theme updated event
    if (this.inlineMode) {
      this.emitThemeUpdate();
    }
  }

  // Apply the current theme immediately (new method)
  private applySelectedTheme() {
    const themeToApply = this.getCurrentTheme();
    this.themeService.applyTheme(themeToApply);
  }

  // Convert hex color to RGB values for CSS variables
  hexToRgb(hex: string): string {
    // Remove the hash if it exists
    hex = hex.replace('#', '');
    
    // Parse the hex values to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  }
  
  // Update CSS RGB variables in the document
  updateRgbVariables(): void {
    document.documentElement.style.setProperty('--main-color-rgb', this.hexToRgb(this.customTheme.mainColor));
    document.documentElement.style.setProperty('--second-color-rgb', this.hexToRgb(this.customTheme.secondColor));
  }

  emitThemeUpdate() {
    this.themeUpdated.emit({
      mainColor: this.customTheme.mainColor,
      secondColor: this.customTheme.secondColor,
      thirdColor: this.customTheme.thirdColor,
      altColor: this.customTheme.altColor,
      mainFontFam: this.customTheme.mainFontFam
    });
  }

  // New method to save theme to backend
  saveTheme() {
    this.isLoading = true;
    this.saveSuccess = false;
    this.saveError = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.errorDetails = '';
    
    if (!this.currentStore) {
      this.isLoading = false;
      this.saveError = true;
      this.errorMessage = 'No active store to update';
      console.error('Theme save failed: No active store');
      return;
    }

    // Validate color values - ensure they are valid hex colors
    const isValidHex = (hex: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    
    let mainColor = this.customTheme.mainColor;
    let secondColor = this.customTheme.secondColor;
    let thirdColor = this.customTheme.thirdColor;
    let altColor = this.customTheme.altColor;
    
    // Add # if missing
    if (!mainColor.startsWith('#')) mainColor = '#' + mainColor;
    if (!secondColor.startsWith('#')) secondColor = '#' + secondColor;
    if (!thirdColor.startsWith('#')) thirdColor = '#' + thirdColor;
    if (!altColor.startsWith('#')) altColor = '#' + altColor;
    
    // Validate all colors
    if (!isValidHex(mainColor) || !isValidHex(secondColor) || 
        !isValidHex(thirdColor) || !isValidHex(altColor)) {
      this.isLoading = false;
      this.saveError = true;
      this.errorMessage = 'One or more color values are invalid. Please select valid colors.';
      console.error('Theme save failed: Invalid color format');
      return;
    }
    
    console.log('Saving theme with values:', {
      mainColor: mainColor,
      secondColor: secondColor,
      thirdColor: thirdColor,
      altColor: altColor,
      fontFamily: this.customTheme.mainFontFam
    });
    
    // Apply theme immediately while saving for instant feedback
    this.applySelectedTheme();
    
    // Create a StoreDetails object with updated theme values
    // Clone the current store to avoid mutating the original
    const updatedStore = { 
      ...this.currentStore,
      theme_1: mainColor,
      theme_2: secondColor,
      theme_3: thirdColor,
      fontColor: altColor,
      fontFamily: this.customTheme.mainFontFam
    };
    
    // Make sure required fields are present
    if (!updatedStore.id) {
      this.isLoading = false;
      this.saveError = true;
      this.errorMessage = 'Store ID is missing. Cannot update store.';
      console.error('Theme save failed: Missing store ID');
      return;
    }
    
    // Ensure fontFamily is properly formatted and not too long
    if (!updatedStore.fontFamily || updatedStore.fontFamily.length > 100) {
      updatedStore.fontFamily = "'Roboto', sans-serif";
    }
    
    // Ensure URL fields are valid or empty
    // When saving a theme, we shouldn't modify existing URLs, but ensure they're valid
    // If we detect invalid URLs, set them to empty string to avoid validation errors
    try {
      if (updatedStore.logoURL && updatedStore.logoURL.trim() !== '') {
        new URL(updatedStore.logoURL);
      }
    } catch (e) {
      console.warn('Invalid logoURL detected, setting to empty to avoid validation error');
      updatedStore.logoURL = '';
    }
    
    try {
      if (updatedStore.bannerURL && updatedStore.bannerURL.trim() !== '') {
        new URL(updatedStore.bannerURL);
      }
    } catch (e) {
      console.warn('Invalid bannerURL detected, setting to empty to avoid validation error');
      updatedStore.bannerURL = '';
    }
    
    console.log('Sending updated store to API:', updatedStore);
    
    this.storeService.updateStore(updatedStore).subscribe({
      next: (response) => {
        console.log('Theme update response:', response);
        this.isLoading = false;
        this.saveSuccess = true;
        this.successMessage = 'Theme saved successfully!';
        
        // Update the current store with the response from the server
        this.currentStore = response;
        
        // Explicitly apply the theme again to ensure consistency
        this.themeService.applyStoreTheme(response);
        
        // Update theme values from the response to ensure consistency
        this.customTheme.mainColor = this.currentStore.theme_1;
        this.customTheme.secondColor = this.currentStore.theme_2;
        this.customTheme.thirdColor = this.currentStore.theme_3;
        this.customTheme.altColor = this.currentStore.fontColor;
        this.customTheme.mainFontFam = this.currentStore.fontFamily;
        
        // Update RGB CSS variables to reflect the new theme
        this.updateRgbVariables();
        
        // Reset the 'themeChanged' flag
        this.themeChanged = false;
        
        // Auto-hide the success message
        setTimeout(() => {
          this.saveSuccess = false;
          this.successMessage = '';
        }, 3000);
      },
      error: (err: any) => {
        console.error('Error saving theme:', err);
        this.isLoading = false;
        this.saveError = true;
        
        // Extract meaningful error message if possible
        if (err.error && err.error.errors) {
          // Detailed validation errors
          const errorKeys = Object.keys(err.error.errors);
          if (errorKeys.length > 0) {
            this.errorMessage = 'Validation error in theme data';
            // Build detailed error message
            this.errorDetails = errorKeys.map(key => 
              `${key}: ${err.error.errors[key]}`
            ).join('\n');
          } else {
            this.errorMessage = 'Server validation error. Please check your input.';
          }
        } else if (err.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.message) {
          this.errorMessage = err.message;
          
          // Try to extract more details if available
          if (err.error && err.error.title) {
            this.errorDetails = `${err.error.title}\n${err.error.traceId || ''}`;
          }
        } else {
          this.errorMessage = 'Failed to save theme. Please try again.';
        }
        
        // Keep the error visible longer for complicated errors
        const hideTimeout = this.errorDetails ? 10000 : 5000;
        
        setTimeout(() => {
          this.saveError = false;
          this.errorMessage = '';
          this.errorDetails = '';
        }, hideTimeout);
      }
    });
  }

  updateColor(event: any, colorProperty: 'mainColor' | 'secondColor' | 'thirdColor' | 'altColor'): void {
    this.customTheme[colorProperty] = event.target.value;
    this.updateCustomTheme();
    this.themeChanged = true;
  }
  
  invertColor(hex: string): string {
    if (hex.indexOf('#') === 0) {
      hex = hex.slice(1);
    }
    
    // Convert to RGB
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // Invert colors
    return `#${(255 - r).toString(16).padStart(2, '0')}${(255 - g).toString(16).padStart(2, '0')}${(255 - b).toString(16).padStart(2, '0')}`;
  }
  
  applyColorHarmony(type: string): void {
    const baseColor = this.customTheme.mainColor;
    let secondColor, thirdColor;
    
    // Convert base color to HSL
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Convert RGB to HSL
    const [h, s, l] = this.rgbToHsl(r, g, b);
    
    switch (type) {
      case 'complementary':
        // Complementary color - opposite on color wheel
        secondColor = this.hslToHex((h + 180) % 360, s, l);
        thirdColor = this.hslToHex(h, Math.max(0.1, s - 0.3), Math.min(0.95, l + 0.3));
        break;
      
      case 'analogous':
        // Analogous colors - adjacent on color wheel
        secondColor = this.hslToHex((h + 30) % 360, s, l);
        thirdColor = this.hslToHex((h + 60) % 360, Math.max(0.1, s - 0.3), Math.min(0.95, l + 0.3));
        break;
      
      case 'monochromatic':
        // Monochromatic - same hue, different saturation/lightness
        secondColor = this.hslToHex(h, Math.min(1, s + 0.3), l);
        thirdColor = this.hslToHex(h, s, Math.min(0.95, l + 0.4));
        break;
      
      case 'triadic':
        // Triadic - three evenly spaced colors on color wheel
        secondColor = this.hslToHex((h + 120) % 360, s, l);
        thirdColor = this.hslToHex((h + 240) % 360, Math.max(0.1, s - 0.2), Math.min(0.95, l + 0.2));
        break;
      
      default:
        return;
    }
    
    // Update the colors
    this.customTheme.secondColor = secondColor;
    this.customTheme.thirdColor = thirdColor;
    this.themeChanged = true;
    this.updateRgbVariables();
  }
  
  // Convert RGB to HSL
  rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h *= 60;
    }
    
    return [h, s, l];
  }
  
  // Convert HSL to Hex
  hslToHex(h: number, s: number, l: number): string {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // Achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, (h / 360) + 1/3);
      g = hue2rgb(p, q, h / 360);
      b = hue2rgb(p, q, (h / 360) - 1/3);
    }
    
    // Convert to hex
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  
  onColorChange(): void {
    this.updateCustomTheme();
    this.themeChanged = true;
  }
  
  onFontChange(): void {
    this.updateCustomTheme();
    this.themeChanged = true;
  }
  
  updatePreview(): void {
    // This method can be used in the future to update any preview elements
    // For now, this is handled automatically through data binding
    this.themeChanged = true;
  }
  
  getDefaultComponents(): string[] {
    // Return a default list of components for the store preview
    return ['header', 'hero', 'featuredProducts', 'categories'];
  }
  
  getThemeForPreview(): StoreTheme {
    return {
      mainColor: this.customTheme.mainColor,
      secondColor: this.customTheme.secondColor, 
      thirdColor: this.customTheme.thirdColor,
      altColor: this.customTheme.altColor,
      mainFontFam: this.customTheme.mainFontFam
    };
  }

  // Add missing methods referenced in the template
  
  /**
   * Set the preview device type (desktop, tablet, mobile)
   */
  setPreviewDevice(device: string): void {
    this.previewDevice = device;
  }
  
  /**
   * Get the list of selected component IDs for the store preview
   */
  getSelectedComponentIds(): string[] {
    return this.getDefaultComponents();
  }
  
  /**
   * Get the current theme for the store preview
   */
  getCurrentTheme(): StoreTheme {
    return this.getThemeForPreview();
  }
}
