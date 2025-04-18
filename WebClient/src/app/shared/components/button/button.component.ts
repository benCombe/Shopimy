import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="button" 
      [ngClass]="[variant, size]" 
      [disabled]="disabled || loading"
      (click)="onClick($event)">
      <span *ngIf="loading" class="spinner"></span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s, opacity 0.2s;
      gap: 0.5rem;
    }

    .button:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    /* Sizes */
    .small {
      font-size: 0.875rem;
      padding: 0.375rem 0.75rem;
    }
    
    .medium {
      font-size: 1rem;
      padding: 0.5rem 1rem;
    }
    
    .large {
      font-size: 1.125rem;
      padding: 0.75rem 1.5rem;
    }

    /* Variants */
    .primary {
      background-color: var(--primary);
      color: white;
    }
    
    .primary:hover:not(:disabled) {
      background-color: var(--primary-dark);
    }
    
    .secondary {
      background-color: var(--secondary);
      color: var(--text);
    }
    
    .secondary:hover:not(:disabled) {
      background-color: var(--secondary-dark);
    }
    
    .tertiary {
      background-color: transparent;
      color: var(--primary);
      box-shadow: inset 0 0 0 1px var(--primary);
    }
    
    .tertiary:hover:not(:disabled) {
      background-color: var(--primary-light);
    }
    
    .danger {
      background-color: var(--error);
      color: white;
    }
    
    .danger:hover:not(:disabled) {
      background-color: var(--error-dark);
    }

    /* Loading spinner */
    .spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() buttonClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    this.buttonClick.emit(event);
  }
} 