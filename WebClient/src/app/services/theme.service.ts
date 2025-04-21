import { StoreService } from './store.service';
import { Injectable, Renderer2, RendererFactory2, OnInit } from '@angular/core';
import { StoreDetails } from '../models/store-details';
import { StoreTheme } from '../models/store-theme.model';

@Injectable({
  providedIn: 'root' // Ensures the service is available throughout the app
})
export class ThemeService {
  private renderer: Renderer2;

  storeDetails: StoreDetails = new StoreDetails(0, "DEFAULT", "DEFAULT", "#232323", "#545454", "#E1E1E1",  "#f6f6f6", "Cambria, Cochin", "BANNER TEXT", "LOGO TEXT", "", "",[]); //Get via API

  constructor(rendererFactory: RendererFactory2, private storeService: StoreService) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.storeService.activeStore$.subscribe(s => {
      this.storeDetails = s;
    })
  }

  /**
   * Applies the complete theme to a specific container element.
   * @param theme - The complete theme object.
   * @param containerSelector - A CSS selector for the container to update.
   */
  applyThemeToContainer(theme: StoreTheme, containerSelector: string): void {
    const container = document.querySelector(containerSelector);
    if (container) {
      this.renderer.setStyle(container, '--main-color', theme.mainColor);
      this.renderer.setStyle(container, '--second-color', theme.secondColor);
      this.renderer.setStyle(container, '--third-color', theme.thirdColor);
      this.renderer.setStyle(container, '--alt-color', theme.altColor);
      this.renderer.setStyle(container, '--main-font-fam', theme.mainFontFam);

      // Update store details
      this.storeDetails.theme_1 = theme.mainColor;
      this.storeDetails.theme_2 = theme.secondColor;
      this.storeDetails.theme_3 = theme.thirdColor;
      this.storeDetails.fontColor = theme.altColor;
      this.storeDetails.fontFamily = theme.mainFontFam;

      // Update store via service
      this.storeService.updateStore(this.storeDetails).subscribe();
    }
  }

  setThemeOne(elemClass: string) {
    const elements = document.querySelectorAll(`.${elemClass}`);
    elements.forEach((element) => {
      this.renderer.setStyle(element as HTMLElement, 'background-color', this.storeDetails.theme_1);
    });
  }

  setThemeTwo(elemClass: string) {
    const elements = document.querySelectorAll(`.${elemClass}`);
    elements.forEach((element) => {
      this.renderer.setStyle(element as HTMLElement, 'background-color', this.storeDetails.theme_2);
    });
  }


  setThemeThree(elemClass: string) {
    const elements = document.querySelectorAll(`.${elemClass}`);
    elements.forEach((element) => {
      this.renderer.setStyle(element as HTMLElement, 'background-color', this.storeDetails.theme_3);
    });
  }


  setFontColor(elemClass: string) {
    const elements = document.querySelectorAll(`.${elemClass}`);
    elements.forEach((element) => {
      this.renderer.setStyle(element as HTMLElement, 'color', this.storeDetails.fontColor);
    });
  }

  setFontFamily(element: string) {
    const elements = document.querySelectorAll(`${element}`);
    elements.forEach((element) => {
      this.renderer.setStyle(element as HTMLElement, 'font-family', this.storeDetails.fontFamily);
    });
  }

  setButtonHoverColor(elemClass: string) {
    const elements = document.querySelectorAll(`.${elemClass}`);

    elements.forEach((element) => {
      const el = element as HTMLElement;

      // Get the original background color, considering CSS styles
      const computedStyle = window.getComputedStyle(el);
      const originalColor = computedStyle.backgroundColor; // This gets the actual background color

      el.addEventListener("mouseover", () => {
        this.renderer.setStyle(el, "background-color", this.lighten(originalColor, 20));
      });

      el.addEventListener("mouseout", () => {
        this.renderer.setStyle(el, "background-color", originalColor); // Restore original color
      });
    });
  }



  private lighten(color: string, percent: number): string{
    let r: number, g: number, b: number;

    if (color.startsWith("#")) {
        // Convert HEX to RGB
        if (!/^#([0-9A-F]{6})$/i.test(color)) {
            throw new Error("Invalid HEX color format. Expected #RRGGBB.");
        }

        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
    } else if (color.startsWith("rgb")) {
        // Extract RGB values from "rgb(r, g, b)" format
        const match = color.match(/\d+/g);
        if (!match || match.length < 3) {
            throw new Error("Invalid RGB color format. Expected rgb(r, g, b).");
        }

        r = parseInt(match[0]);
        g = parseInt(match[1]);
        b = parseInt(match[2]);
    } else {
        throw new Error("Unsupported color format. Use HEX (#RRGGBB) or RGB (rgb(r, g, b)).");
    }

    // Lighten each color channel
    r = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
    g = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
    b = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));

    // Return as RGB (since browsers convert colors to RGB)
    return `rgb(${r}, ${g}, ${b})`;
  }

}
