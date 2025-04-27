// import { Component, Input, Output, EventEmitter } from '@angular/core';
// import { CommonModule } from '@angular/common';
// 
// @Component({
//   selector: 'app-button',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <button 
//       class="standard-button" 
//       [ngClass]="[variant, size]" 
//       [disabled]="disabled || loading"
//       (click)="onClick($event)">
//       <span *ngIf="loading" class="spinner"></span>
//       <ng-content></ng-content>
//     </button>
//   `,
//   styles: [`
//     /* Loading spinner */
//     .spinner {
//       width: 1rem;
//       height: 1rem;
//       border: 2px solid rgba(255, 255, 255, 0.3);
//       border-radius: 50%;
//       border-top-color: white;
//       animation: spin 0.8s linear infinite;
//     }
//     
//     @keyframes spin {
//       to { transform: rotate(360deg); }
//     }
//   `]
// })
// export class ButtonComponent {
//   @Input() variant: ButtonVariant = 'primary';
//   @Input() size: ButtonSize = 'medium';
//   @Input() disabled = false;
//   @Input() loading = false;
//   @Output() buttonClick = new EventEmitter<MouseEvent>();
// 
//   onClick(event: MouseEvent): void {
//     this.buttonClick.emit(event);
//   }
// } 