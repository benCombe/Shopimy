import { StoreService } from './store.service';
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { StoreDetails } from '../models/store-details';
import { StoreTheme } from '../models/store-theme.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root' // Ensures the service is available throughout the app
})
export class ThemeService {
  private renderer: Renderer2;
  private readonly defaultTheme: StoreTheme = {
    mainColor: '#393727',
    secondColor: '#D0933D',
    thirdColor: '#D3CEBB',
    altColor: '#FFFFFF',
    mainFontFam: 'Cambria, Cochin'
  };

  constructor(rendererFactory: RendererFactory2, private storeService: StoreService) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Applies the base theme to the application
   * This is used for general Shopimy platform pages
   */
  applyBaseTheme(): void {
    this.applyThemeToRootElement({
      mainColor: getComputedStyle(document.documentElement).getPropertyValue('--main-color').trim() || this.defaultTheme.mainColor,
      secondColor: getComputedStyle(document.documentElement).getPropertyValue('--second-color').trim() || this.defaultTheme.secondColor,
      thirdColor: getComputedStyle(document.documentElement).getPropertyValue('--third-color').trim() || this.defaultTheme.thirdColor,
      altColor: getComputedStyle(document.documentElement).getPropertyValue('--alt-color').trim() || this.defaultTheme.altColor,
      mainFontFam: getComputedStyle(document.documentElement).getPropertyValue('--main-font-fam').trim() || this.defaultTheme.mainFontFam
    });
  }

  /**
   * Applies a store-specific theme to the application
   * @param store - The store details containing theme information
   */
  applyStoreTheme(store: StoreDetails): void {
    if (!store) return;
    
    this.applyThemeToRootElement({
      mainColor: store.theme_1 || this.defaultTheme.mainColor,
      secondColor: store.theme_2 || this.defaultTheme.secondColor,
      thirdColor: store.theme_3 || this.defaultTheme.thirdColor,
      altColor: store.fontColor || this.defaultTheme.altColor,
      mainFontFam: store.fontFamily || this.defaultTheme.mainFontFam
    });
  }

  /**
   * Applies the provided theme object directly 
   * @param theme - The theme object to apply
   */
  applyTheme(theme: StoreTheme): void {
    if (!theme) return;
    this.applyThemeToRootElement(theme);
  }

  /**
   * Core method to apply theme variables to root element
   * @param theme - The theme object with color and font values
   */
  private applyThemeToRootElement(theme: StoreTheme): void {
    const rootElement = document.documentElement;
    
    this.renderer.setStyle(rootElement, '--main-color', theme.mainColor);
    this.renderer.setStyle(rootElement, '--second-color', theme.secondColor);
    this.renderer.setStyle(rootElement, '--third-color', theme.thirdColor);
    this.renderer.setStyle(rootElement, '--alt-color', theme.altColor);
    this.renderer.setStyle(rootElement, '--main-font-fam', theme.mainFontFam);
    
    // Also set RGB variants for main and second colors for rgba usage
    const mainColorRgb = this.hexToRgb(theme.mainColor);
    const secondColorRgb = this.hexToRgb(theme.secondColor);
    
    if (mainColorRgb) {
      this.renderer.setStyle(rootElement, '--main-color-rgb', mainColorRgb);
    }
    
    if (secondColorRgb) {
      this.renderer.setStyle(rootElement, '--second-color-rgb', secondColorRgb);
    }
  }

  /**
   * Helper function to convert hex color to RGB format
   * @param hex - The hex color code to convert
   * @returns RGB values as a string (e.g., "255, 255, 255")
   */
  private hexToRgb(hex: string): string | null {
    // Check if color is in hex format
    if (!hex || !hex.startsWith('#')) return null;
    
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse hex to RGB
    let r, g, b;
    if (hex.length === 3) {
      // For 3-digit hex codes
      r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else if (hex.length === 6) {
      // For 6-digit hex codes
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      return null;
    }
    
    return `${r}, ${g}, ${b}`;
  }

  /**
   * Returns a list of available themes to choose from
   * @returns Observable with array of themes
   */
  getAvailableThemes(): Observable<any[]> {
    // For now, return predefined themes
    // This could be replaced with an API call in the future
    return of([
      {
        id: 'default',
        name: 'Default Theme',
        mainColor: '#393727',
        secondColor: '#D0933D',
        thirdColor: '#D3CEBB',
        altColor: '#FFFFFF',
        mainFontFam: 'sans-serif'
      },
      {
        id: 'light',
        name: 'Light Theme',
        mainColor: '#ffffff',
        secondColor: '#f5f5f5',
        thirdColor: '#e0e0e0',
        altColor: '#333333',
        mainFontFam: 'Arial, sans-serif'
      },
      {
        id: 'dark',
        name: 'Dark Theme',
        mainColor: '#1a1a1a',
        secondColor: '#333333',
        thirdColor: '#4d4d4d',
        altColor: '#f5f5f5',
        mainFontFam: 'Arial, sans-serif'
      },
      {
        id: 'blue',
        name: 'Blue Theme',
        mainColor: '#1e3a8a',
        secondColor: '#3b82f6',
        thirdColor: '#93c5fd',
        altColor: '#ffffff',
        mainFontFam: 'Verdana, sans-serif'
      },
      {
        id: 'hotdog',
        name: 'Hotdog Stand',
        mainColor: '#FF0000',
        secondColor: '#FFFF00',
        thirdColor: '#000000',
        altColor: '#FFFFFF',
        mainFontFam: 'sans-serif'
      }
    ]);
  }
}
