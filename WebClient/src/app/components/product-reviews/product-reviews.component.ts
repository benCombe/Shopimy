import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-product-reviews',
  templateUrl: './product-reviews.component.html',
  styleUrls: ['./product-reviews.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe
  ]
})
export class ProductReviewsComponent implements OnInit, OnChanges {
  @Input() productId!: number; // Receive productId from parent component

  averageRating$: Observable<number | null> = of(null);
  reviews$: Observable<Review[]> = of([]);
  loadingError = false;

  constructor(private reviewService: ReviewService) { }

  ngOnInit(): void {
    // Initial load if productId is already set
    if (this.productId) {
      this.loadReviews();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload reviews if productId input changes
    if (changes['productId'] && !changes['productId'].firstChange) {
      if (this.productId) {
        this.loadReviews();
      } else {
        // Clear reviews if productId becomes undefined/null
        this.averageRating$ = of(null);
        this.reviews$ = of([]);
        this.loadingError = false;
      }
    }
  }

  private loadReviews(): void {
    this.loadingError = false;
    console.log(`Loading reviews for product ID: ${this.productId}`); // Debugging

    this.averageRating$ = this.reviewService.getAverageRatingForProduct(this.productId)
      .pipe(
        map(response => response ? response.averageRating : null),
        catchError(err => {
          console.error('Error loading average rating:', err); // Log error
          this.loadingError = true;
          return of(null); // Return null on error
        })
      );

    this.reviews$ = this.reviewService.getReviewsForProduct(this.productId)
      .pipe(
        catchError(err => {
          console.error('Error loading reviews:', err); // Log error
          this.loadingError = true;
          return of([]); // Return empty array on error
        })
      );
  }
}
