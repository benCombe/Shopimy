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
      console.error('Upload attempted without file selection');
      return;
    }
    
    console.log('Starting logo upload process for file:', this.selectedFile.name);
    this.isUploading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const sub = this.logoService.uploadLogo(this.selectedFile)
      .pipe(
        catchError(error => {
          console.error('Logo upload error:', error);
          this.errorMessage = error.message || 'Error uploading logo';
          return of('');
        }),
        finalize(() => {
          this.isUploading = false;
          console.log('Logo upload process completed');
        })
      )
      .subscribe(logoUrl => {
        if (logoUrl) {
          console.log('Logo uploaded successfully, URL:', logoUrl);
          
          // Update the current logo URL first
          this.currentLogoUrl = logoUrl;
          this.logoLoadError = false;
          
          // After upload, reload the image from API
          this.loadCurrentLogo();
          this.successMessage = 'Logo uploaded successfully!';
          this.selectedFile = null;
          this.logoPreviewUrl = null;
          
          // Inform store service about the update - more robust approach
          this.updateStoreWithLogo(logoUrl);
          
          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          console.warn('Logo upload completed but no URL was returned');
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
    console.log('Updating store with new logo URL:', logoUrl);
    
    // Get current store from service
    const currentStore = this.storeService.activeStoreSubject.value;
    if (currentStore) {
      // Create a deep copy to avoid direct mutation
      // Make sure we're preserving all properties exactly as they are
      const updatedStore = { 
        ...currentStore,
        logoURL: logoUrl,
        // Ensure these critical properties are correctly set
        id: currentStore.id,
        url: currentStore.url,
        name: currentStore.name,
        // Make sure componentVisibility is properly copied
        componentVisibility: currentStore.componentVisibility ? 
          { ...currentStore.componentVisibility } : 
          currentStore.componentVisibility
      };
      
      // Update the store via service to ensure backend synchronization
      this.storeService.updateStore(updatedStore).subscribe({
        next: (response) => {
          console.log('Store updated with new logo URL:', response);
        },
        error: (err) => {
          console.error('Failed to update store with new logo:', err);
          // Still update the local subject to maintain UI consistency
          this.storeService.activeStoreSubject.next(updatedStore);
        }
      });
    } else {
      console.error('Cannot update store: no active store available');
    }
  }
}
