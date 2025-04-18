import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="statusClass">
      {{ text }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
      font-size: 0.875rem;
      font-weight: 500;
      text-align: center;
      white-space: nowrap;
    }
    
    .success {
      background-color: var(--success-light);
      color: var(--success-dark);
    }
    
    .warning {
      background-color: var(--warning-light);
      color: var(--warning-dark);
    }
    
    .error {
      background-color: var(--error-light);
      color: var(--error-dark);
    }
    
    .info {
      background-color: var(--info-light);
      color: var(--info-dark);
    }
    
    .pending {
      background-color: var(--pending-light);
      color: var(--pending-dark);
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: StatusType = 'info';
  @Input() text: string = '';
  
  get statusClass(): string {
    return this.status;
  }
} 