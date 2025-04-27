/*
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-success',
  template: `
    <div class="global-container">
      <div class="success-container">
        <div class="icon-wrapper center">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <h2>Payment Successful!</h2>
        <p>Your order has been processed successfully.</p>
        <p>Thank you for your purchase!</p>
        <div class="actions">
          <a routerLink="/" class="standard-button">Return to Homepage</a>
          <a routerLink="/my-orders" class="standard-button secondary">View My Orders</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
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
      background-color: var(--color-success-light, #e8f5e9);
      border-radius: var(--border-radius-round);
    }
    
    .icon-wrapper i {
      font-size: 40px;
      color: var(--color-success, #059669);
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
    
    .actions {
      margin-top: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: center;
    }
    
    @media (min-width: 576px) {
      .actions {
        flex-direction: row;
        justify-content: center;
      }
    }
  `],
  standalone: true,
  imports: [RouterLink]
})
export class SuccessComponent {}
*/
