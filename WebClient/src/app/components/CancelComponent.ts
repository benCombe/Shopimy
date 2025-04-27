/*
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cancel',
  template: `
    <div class="global-container">
      <div class="cancel-container">
        <div class="icon-wrapper center">
          <i class="fa-solid fa-circle-xmark"></i>
        </div>
        <h2>Payment Cancelled or Failed</h2>
        <p>Unfortunately, your payment could not be completed or was cancelled.</p>

        <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>

        <p>You have not been charged.</p>

        <p>What would you like to do next?</p>
        <div class="actions">
            <button (click)="returnToCart()" class="standard-button secondary">Return to Cart</button>
            <button (click)="tryAgain()" class="standard-button">Try Checkout Again</button>
        </div>
        <a routerLink="/contact-support" class="support-link">Contact Support</a>
      </div>
    </div>
  `,
  styles: [`
    .cancel-container {
      max-width: 600px;
      margin: var(--spacing-xl) auto;
      padding: var(--spacing-xl);
      border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
      border-radius: var(--border-radius);
      text-align: center;
      background-color: var(--third-color);
      box-shadow: var(--shadow-md);
      font-family: var(--main-font-fam);
    }
    
    .icon-wrapper {
      width: 80px;
      height: 80px;
      margin: 0 auto var(--spacing-lg);
      background-color: var(--color-error-light, #fde8e8);
      border-radius: var(--border-radius-round);
    }
    
    .icon-wrapper i {
      font-size: 40px;
      color: var(--color-error, #e02424);
    }
    
    h2 {
      color: var(--main-color);
      margin-bottom: var(--spacing-md);
      font-size: 1.8rem;
      font-weight: 600;
    }
    
    p {
      color: var(--main-color);
      line-height: 1.6;
      margin-bottom: var(--spacing-sm);
      font-size: 1.1rem;
    }
    
    .error-message {
      color: var(--color-error, #e02424);
      font-weight: 600;
      margin: var(--spacing-md) 0;
      padding: var(--spacing-sm);
      border: 1px solid var(--color-error, #e02424);
      border-radius: var(--border-radius);
      background-color: var(--color-error-light, #fde8e8);
    }
    
    .actions {
      margin-top: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: center;
    }
    
    .support-link {
      display: inline-block;
      color: var(--second-color);
      text-decoration: underline;
      margin-top: var(--spacing-md);
      font-size: 1rem;
    }

    .support-link:hover {
      color: var(--main-color);
    }

    @media (min-width: 576px) {
      .actions {
        flex-direction: row;
        justify-content: center;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class CancelComponent implements OnInit {
  errorMessage: string | null = null;
  storeUrl: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.storeUrl = params['storeUrl'];

      const errorCode = params['error_code'];
      if (errorCode) {
          this.errorMessage = `There was an issue processing your payment (Code: ${this.mapErrorCode(errorCode)}). Please try again or contact support.`;
      }
    });
  }

  mapErrorCode(code: string): string {
      switch(code) {
          case 'payment_intent_authentication_failure': return 'AuthFailed';
          default: return 'General';
      }
  }

  returnToCart(): void {
      if (this.storeUrl) {
        this.router.navigate(['/' + this.storeUrl, 'cart']);
      } else {
        console.warn('CancelComponent: storeUrl not found, navigating to home.');
        this.router.navigate(['/']);
      }
  }

  tryAgain(): void {
      if (this.storeUrl) {
          this.router.navigate(['/' + this.storeUrl, 'checkout']);
      } else {
          console.warn('CancelComponent: storeUrl not found, navigating to home.');
          this.router.navigate(['/']);
      }
  }
}
*/
