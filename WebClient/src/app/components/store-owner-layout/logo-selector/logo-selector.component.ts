import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // For file upload (if needed)
import { Store } from '../../../models/store';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';

@Component({
  selector: 'app-logo-selector',
  templateUrl: './logo-selector.component.html',
  styleUrls: ['./logo-selector.component.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class LogoSelectorComponent {
  // For demonstration, we'll work with a local store object.
  // In a real app, you'd load and update this via an API.
  storeDetails: Store = new Store("KnittingNut", "#177E89", "#084C61", "#7A917A", "Cambria, Cochin", "#f0f0f0", "assets/images/default.png");

  // To hold a local preview of the selected file.
  logoPreviewUrl: string | ArrayBuffer | null = null;

  // Inject HttpClient if you're uploading the file to a server
  constructor(private http: HttpClient) {}

  // Called when a file is selected
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Optionally, you can upload the file here via HttpClient
      // e.g., this.uploadLogo(file).subscribe((url: string) => { ... });

      // For a quick preview, we use FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result !== undefined) {
          this.logoPreviewUrl = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }


  saveLogo(): void {
    if (this.logoPreviewUrl) {
      // In a real scenario, this would be the URL returned by your file upload API.
      // Here, we'll just use the preview URL.
      this.storeDetails.LogoUrl = this.logoPreviewUrl as string;
      alert('Logo updated successfully!');
    }
  }
  uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post<{ logoUrl: string }>('YOUR_API_ENDPOINT', formData)
      .pipe(map(response => response.logoUrl));
  }
}
