import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LogoService } from '../../../services/logo.service';
import { StoreService } from '../../../services/store.service';
import { catchError, finalize, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-logo-selector',
  templateUrl: './logo-selector.html',
  styleUrls: ['./logo-selector.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LogoSelectorComponent implements OnInit, OnDestroy {
  // Current logo data URL
  currentLogoUrl: string = '';
  
  // For temporary preview during selection
  logoPreviewUrl: string | ArrayBuffer | null = null;
  
  // UI State
  isUploading = false;
  isDeleting = false;
  selectedFile: File | null = null;
  errorMessage = '';
  successMessage = '';
  logoLoadError = false;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];
  
  constructor(
    private logoService: LogoService,
    private storeService: StoreService
  ) {}
  
  ngOnInit(): void {
    this.loadCurrentLogo();
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Revoke any object URLs to prevent memory leaks
    if (this.currentLogoUrl && this.currentLogoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.currentLogoUrl);
    }
  }
  
  // Load the current logo via API
  loadCurrentLogo(): void {
    this.logoLoadError = false;
    const sub = this.logoService.getLogoFile().subscribe({
      next: (blob) => {
        // Create object URL for image
        if (this.currentLogoUrl && this.currentLogoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(this.currentLogoUrl);
        }
        this.currentLogoUrl = URL.createObjectURL(blob);
      },
      error: (err) => {
        this.logoLoadError = true;
        console.error('Cannot load logo file via API:', err);
        // Don't show error message to user as we already show a UI indication
      }
    });
    this.subscriptions.push(sub);
  }
  
  // Called when a file is selected
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Only JPG, PNG, and GIF images are allowed.';
        input.value = ''; // Clear the input
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.errorMessage = 'File is too large. Maximum size is 5MB.';
        input.value = ''; // Clear the input
        return;
      }
      
      this.selectedFile = file;
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result !== undefined) {
          this.logoPreviewUrl = e.target.result;
        }
      };
      reader.readAsDataURL(this.selectedFile);
      
      // Clear any previous messages
      this.errorMessage = '';
      this.successMessage = '';
    }
  }
  
  // Reset file selection and preview
  cancelSelection(): void {
    this.selectedFile = null;
    this.logoPreviewUrl = null;
    this.errorMessage = '';
  }
  
  // Handle image load errors
  handleImageError(event: Event): void {
    this.logoLoadError = true;
    console.error('Failed to load logo image:', this.currentLogoUrl);
  }
  
  // Upload the selected logo file
  uploadLogo(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first.';
      return;
    }
    
    this.isUploading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const sub = this.logoService.uploadLogo(this.selectedFile)
      .pipe(
        catchError(error => {
          this.errorMessage = error.message || 'Error uploading logo';
          return of('');
        }),
        finalize(() => {
          this.isUploading = false;
        })
      )
      .subscribe(logoUrl => {
        if (logoUrl) {
          // After upload, reload the image from API
          this.logoLoadError = false;
          this.loadCurrentLogo();
          this.successMessage = 'Logo uploaded successfully!';
          this.selectedFile = null;
          this.logoPreviewUrl = null;
          
          // Inform store service about the update
          this.storeService.getCurrentUserStore().subscribe();
          
          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        }
      });
    
    this.subscriptions.push(sub);
  }
  
  // Delete the current logo
  deleteLogo(): void {
    if (!this.currentLogoUrl) {
      this.errorMessage = 'No logo to delete.';
      return;
    }
    
    this.isDeleting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const sub = this.logoService.deleteLogo()
      .pipe(
        catchError(error => {
          this.errorMessage = error.message || 'Error deleting logo';
          return of(false);
        }),
        finalize(() => {
          this.isDeleting = false;
        })
      )
      .subscribe(success => {
        if (success) {
          // Revoke the blob URL to prevent memory leaks
          if (this.currentLogoUrl && this.currentLogoUrl.startsWith('blob:')) {
            URL.revokeObjectURL(this.currentLogoUrl);
          }
          
          this.currentLogoUrl = '';
          this.successMessage = 'Logo deleted successfully!';
          this.logoLoadError = false;
          
          // Inform store service about the update
          this.storeService.getCurrentUserStore().subscribe();
          
          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        }
      });
    
    this.subscriptions.push(sub);
  }
  
  // Update the store details with the new logo URL
  private updateStoreWithLogo(logoUrl: string): void {
    // Get current store from service
    const currentStore = this.storeService.activeStoreSubject.value;
    if (currentStore) {
      // Update the store's logo URL
      currentStore.logoURL = logoUrl;
      
      // Push the updated store back to the subject
      this.storeService.activeStoreSubject.next(currentStore);
    }
  }
}
