import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
export class StorePreviewComponent implements AfterViewInit, OnChanges {
  @Input() theme: StoreTheme | null = null;
  @Input() selectedComponents: string[] | null = null;
  @Input() storeData: StoreDetails | null = null;

  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;
  
  previewUrl: SafeResourceUrl;
  showFallback: boolean = false;
  frameLoaded: boolean = false;

  constructor(private sanitizer: DomSanitizer) {
    // Initial URL for the preview iframe
    // We might pass the store URL later if needed via query params
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl('assets/preview.html');
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If any relevant input changes, update the preview
    if (this.frameLoaded && this.previewFrame?.nativeElement?.contentWindow) {
      this.sendUpdateToPreview();
    }
  }

  ngAfterViewInit(): void {
    // Send initial state when the iframe is ready
    this.previewFrame.nativeElement.onload = () => {
      this.frameLoaded = true;
      this.showFallback = false;
      this.sendUpdateToPreview();
    };

    // Set a timeout to show the fallback if the iframe doesn't load
    setTimeout(() => {
      if (!this.frameLoaded) {
        this.showFallback = true;
      }
    }, 3000); // 3 seconds timeout
  }

  onFrameLoad(): void {
    this.frameLoaded = true;
    this.showFallback = false;
  }

  onFrameError(): void {
    this.frameLoaded = false;
    this.showFallback = true;
  }

  private sendUpdateToPreview(): void {
    if (this.previewFrame?.nativeElement?.contentWindow) {
      const message = {
        type: 'updatePreview',
        theme: this.theme,
        components: this.selectedComponents,
        storeData: this.storeData
      };
      
      try {
        // Use '*' for targetOrigin in development, specify origin in production
        this.previewFrame.nativeElement.contentWindow.postMessage(message, '*');
        console.log("Sent update to preview iframe:", message);
      } catch (error) {
        console.error("Error sending message to preview iframe:", error);
        this.showFallback = true;
      }
    } else {
      console.log("Preview iframe not ready to receive messages yet.");
      this.showFallback = true;
    }
  }
} 