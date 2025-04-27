// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';
// 
// @Component({
//   selector: 'app-card',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="card" [ngClass]="cardClasses">
//       <ng-content></ng-content>
//     </div>
//   `,
//   styles: [`
//     .card {
//       border-radius: 8px;
//       padding: 1rem;
//       width: 100%;
//     }
//     
//     .default {
//       background-color: var(--surface);
//       box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//     }
//     
//     .elevated {
//       background-color: var(--surface);
//       box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
//     }
//     
//     .outlined {
//       background-color: transparent;
//       border: 1px solid var(--border-color);
//     }
//   `]
// })
// export class CardComponent {
//   @Input() variant: CardVariant = 'default';
//   
//   get cardClasses(): string {
//     return this.variant;
//   }
// } 