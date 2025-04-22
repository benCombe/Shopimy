import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class LogoService {
  private apiUrl = `${environment.apiUrl}/api/logo`;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) { }

  // Upload a new logo
  uploadLogo(file: File): Observable<string> {
    const token = this.cookieService.get('auth_token');
    if (!token) {
      console.error('Authentication token not found. Cannot upload logo.');
      return throwError(() => new Error('Authentication required.'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const formData = new FormData();
    formData.append('logo', file);
    
    return this.http.post<{ logoUrl: string }>(this.apiUrl + '/upload', formData, { headers }).pipe(
      map(response => response.logoUrl),
      catchError(error => {
        console.error('Error uploading logo:', error);
        return throwError(() => new Error('Failed to upload logo.'));
      })
    );
  }

  // Get the current logo URL
  getCurrentLogo(): Observable<string> {
    const token = this.cookieService.get('auth_token');
    if (!token) {
      console.error('Authentication token not found. Cannot get logo.');
      return throwError(() => new Error('Authentication required.'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<{ logoUrl: string }>(this.apiUrl, { headers }).pipe(
      map(response => response.logoUrl || ''),
      catchError(error => {
        console.error('Error getting logo:', error);
        return throwError(() => new Error('Failed to get logo.'));
      })
    );
  }

  // Delete the current logo
  deleteLogo(): Observable<boolean> {
    const token = this.cookieService.get('auth_token');
    if (!token) {
      console.error('Authentication token not found. Cannot delete logo.');
      return throwError(() => new Error('Authentication required.'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.delete<{ success: boolean }>(this.apiUrl, { headers }).pipe(
      map(response => response.success),
      catchError(error => {
        console.error('Error deleting logo:', error);
        return throwError(() => new Error('Failed to delete logo.'));
      })
    );
  }

  // Get the raw logo file
  getLogoFile(): Observable<Blob> {
    const token = this.cookieService.get('auth_token');
    if (!token) {
      console.error('Authentication token not found. Cannot get logo file.');
      return throwError(() => new Error('Authentication required.'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/file`, { headers, responseType: 'blob' });
  }
} 