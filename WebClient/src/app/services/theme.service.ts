import { StoreService } from './store.service';
import { Injectable, Renderer2, RendererFactory2, OnInit } from '@angular/core';
import { StoreDetails } from '../models/store-details';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root' // Ensures the service is available throughout the app
})
export class ThemeService {
  private renderer: Renderer2;
  private apiUrl = environment.apiUrl;

  storeDetails: StoreDetails = new StoreDetails(0, "DEFAULT", "DEFAULT", "#232323", "#545454", "#E1E1E1",  "#f6f6f6", "Cambria, Cochin", "BANNER TEXT", "LOGO TEXT", "", "", []); //Get via API

  private activeThemeSubject = new BehaviorSubject<StoreDetails>(this.storeDetails);
  public activeTheme$ : Observable<StoreDetails> = this.activeThemeSubject.asObservable();
  
  constructor(
    rendererFactory: RendererFactory2, 
    private storeService: StoreService,
    private http: HttpClient
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.storeService.activeStore$.subscribe(s => {
      this.storeDetails = s;
    });
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

  setBannerText(elemClass: string) {
    const elements = document.querySelectorAll(`.${elemClass}`);
    elements.forEach((element) => {
      this.renderer.setProperty(element as HTMLElement, 'innerText', this.storeDetails.bannerText);
    });
  }

  setLogoText(elemClass: string) {
    const elements = document.querySelectorAll(`.${elemClass}`);
    elements.forEach((element) => {
      this.renderer.setProperty(element as HTMLElement, 'innerText', this.storeDetails.logoText);
    });
  }

  setLogoUrl(elemClass: string) {
    const elements = document.querySelectorAll(`.${elemClass}`);
    elements.forEach((element) => {
      this.renderer.setAttribute(element as HTMLElement, 'src', this.storeDetails.logoURL || '');
    });
  }

  setBannerUrl(elemClass: string) {
    const elements = document.querySelectorAll(`.${elemClass}`);
    elements.forEach((element) => {
      this.renderer.setAttribute(element as HTMLElement, 'src', this.storeDetails.bannerURL || '');
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

  private lighten(color: string, percent: number): string {
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

  /**
   * Uploads an image file for a store to Azure Blob Storage
   * @param file The file to upload
   * @param storeId The ID of the store
   * @param imageType Type of image ('logo' or 'banner')
   * @returns Observable with the upload progress and response
   */
  uploadImage(file: File, storeId: number, imageType: 'logo' | 'banner'): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = `${this.apiUrl}/Store/upload-image?storeId=${storeId}&imageType=${imageType}`;
    
    return this.http.post<any>(url, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      tap(event => {
        if (event.type === HttpEventType.Response) {
          if (event instanceof HttpResponse && event.body && event.body.success) {
            // Update the local store details with the new image path from Azure Blob Storage
            if (imageType === 'logo') {
              this.storeDetails.logoURL = event.body.filePath;
              // Update logo elements if any are present
              this.setLogoUrl('logo-image');
            } else if (imageType === 'banner') {
              this.storeDetails.bannerURL = event.body.filePath;
              // Update banner elements if any are present
              this.setBannerUrl('banner-image');
            }
          }
        }
      })
    );
  }

  /**
   * Helper method to get the file extension from a file
   * @param file The file to get the extension from
   * @returns The file extension (e.g., '.jpg', '.png')
   */
  getFileExtension(file: File): string {
    return file.name.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Validates if a file is an acceptable image
   * @param file The file to validate
   * @returns Boolean indicating if the file is valid
   */
  isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024; // 5MB limit
  }
}
