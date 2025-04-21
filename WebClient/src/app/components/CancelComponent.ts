import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cancel',
  template: `
    <div class="cancel-container">
      <h2>Payment Cancelled or Failed</h2>
      <p>Unfortunately, your payment could not be completed or was cancelled.</p>

      <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>

      <p>You have not been charged.</p>

      <p>What would you like to do next?</p>
      <div class="actions">
          <button (click)="returnToCart()" class="standard-button secondary-button">Return to Cart</button>
          <button (click)="tryAgain()" class="standard-button">Try Checkout Again</button>
          <a routerLink="/contact-support" class="support-link">Contact Support</a>
      </div>
    </div>
  `,
  styles: [`
    .cancel-container {
      max-width: 600px;
      margin: 40px auto;
      padding: 30px;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 8px;
      text-align: center;
      background-color: var(--background-color, #fff);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h2 {
      color: var(--error-color, #dc3545);
      margin-bottom: 15px;
    }
    p {
      color: var(--text-color-secondary, #555);
      line-height: 1.6;
      margin-bottom: 10px;
    }
    .error-message {
        color: var(--error-color, #dc3545);
        font-weight: bold;
        margin-top: 15px;
        margin-bottom: 15px;
        padding: 10px;
        border: 1px solid var(--error-color, #dc3545);
        border-radius: 4px;
        background-color: var(--error-background-color, #f8d7da);
    }
    .actions {
      margin-top: 30px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      align-items: center;
    }
    .standard-button, .support-link {
        padding: 10px 20px;
        min-width: 150px;
        text-align: center;
    }
    .secondary-button {
        background-color: var(--button-secondary-bg, #6c757d);
        color: var(--button-secondary-text, #fff);
        border-color: var(--button-secondary-border, #6c757d);
    }
    .secondary-button:hover {
        background-color: var(--button-secondary-hover-bg, #5a6268);
        border-color: var(--button-secondary-hover-border, #545b62);
    }
    .support-link {
      display: inline-block;
      color: var(--link-color, #007bff);
      text-decoration: underline;
      margin-top: 10px;
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
      } else {
          // Default cancellation message if no specific error found in params
          // Optional: could add a generic "If you encountered an issue..." message here too
      }
    });
  }

  mapErrorCode(code: string): string {
      switch(code) {
          case 'payment_intent_authentication_failure': return 'AuthFailed';
          // Add other known Stripe error codes if necessary
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
