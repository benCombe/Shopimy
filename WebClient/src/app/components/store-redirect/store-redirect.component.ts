import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-store-redirect',
  template: '<div>Redirecting to your store...</div>',
  standalone: true
})
export class StoreRedirectComponent implements OnInit {
  constructor(
    private router: Router,
    private storeService: StoreService
  ) {}

  ngOnInit() {
    this.storeService.getCurrentUserStore().subscribe({
      next: (store) => {
        if (store && store.url) {
          // Navigate to the user's store page
          this.router.navigate(['/', store.url]);
        } else {
          // If user doesn't have a store yet, redirect to dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Error finding user store:', err);
        // In case of error, go to dashboard
        this.router.navigate(['/dashboard']);
      }
    });
  }
} 