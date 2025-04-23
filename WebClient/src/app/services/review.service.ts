import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, AverageRating } from '../models/review.model'; // Adjust path if needed
import { environment } from '../../environments/environment'; // Assuming you have environment files for API base URL

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/api/Reviews`; // Add /api/ prefix

  constructor(private http: HttpClient) { }

  getReviewsForProduct(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/Product/${productId}`);
  }

  getAverageRatingForProduct(productId: number): Observable<AverageRating> {
    return this.http.get<AverageRating>(`${this.apiUrl}/Product/${productId}/AverageRating`);
  }

  // Add method for creating reviews later if needed
  // addReview(review: Omit<Review, 'id' | 'createdAt'>): Observable<Review> { ... }
} 