import { StoreService } from './store.service';
import { Injectable, Renderer2, RendererFactory2, OnInit } from '@angular/core';
import { StoreDetails } from '../models/store-details';

@Injectable({
  providedIn: 'root' // Ensures the service is available throughout the app
})
export class ThemeService {
  private renderer: Renderer2;

  storeDetails: StoreDetails = new StoreDetails(0, "knittingnut", "KnittingNut", "#393727", "#D0933D", "#d5d5d5", "Cambria, Cochin", "#f6f6f6", "Explore Our Knitting Products!", "TEXT ABOUT THE STORE AND WHY IT IS AWHSUM", []); //Get via API

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
  /* applyThemeToContainer(theme: StoreDetails, containerSelector: string): void {
    const container = document.querySelector(containerSelector);
    if (container) {
      this.renderer.setStyle(container, '--main-color', theme.theme_1);
      this.renderer.setStyle(container, '--second-color', theme.theme_2);
      this.renderer.setStyle(container, '--third-color', theme.theme_3);
      this.renderer.setStyle(container, '--alt-color', theme.fontColor);
      this.renderer.setStyle(container, '--main-font-fam', theme.fontFamily);
    }
  } */

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
