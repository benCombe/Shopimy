// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { StoreDetails } from '../../../models/store-details';
// import { StoreTheme } from '../../../models/store-theme.model';
// 
// @Component({
//   selector: 'app-store-footer',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './store-footer.component.html',
//   styleUrls: ['./store-footer.component.css']
// })
// export class StoreFooterComponent {
//   @Input() storeData: StoreDetails | null = null;
//   @Input() theme: StoreTheme | null = null;
//   
//   getCurrentYear(): number {
//     return new Date().getFullYear();
//   }
//   
//   getStoreName(): string {
//     return this.storeData?.name || 'Store Name';
//   }
//   
//   getThemeStyles(): { [key: string]: string } {
//     const styles: { [key: string]: string } = {};
//     
//     if (this.theme) {
//       // Apply direct background style
//       styles['background-color'] = this.theme.mainColor || '#393727';
//       
//       // Footer specific variables
//       styles['--footer-bg'] = this.theme.mainColor || '#393727';
//       styles['--footer-text-color'] = this.theme.altColor || '#ffffff';
//       styles['--footer-border-color'] = 'rgba(255, 255, 255, 0.2)';
//       styles['--footer-hover-color'] = this.theme.secondColor || '#D0933D';
//       styles['--footer-shadow'] = 'rgba(0, 0, 0, 0.1)';
//     } else if (this.storeData) {
//       // Apply direct background style
//       styles['background-color'] = this.storeData.theme_1 || '#393727';
//       
//       // Footer specific variables
//       styles['--footer-bg'] = this.storeData.theme_1 || '#393727';
//       styles['--footer-text-color'] = this.storeData.fontColor || '#ffffff';
//       styles['--footer-border-color'] = 'rgba(255, 255, 255, 0.2)';
//       styles['--footer-hover-color'] = this.storeData.theme_2 || '#D0933D';
//       styles['--footer-shadow'] = 'rgba(0, 0, 0, 0.1)';
//     }
//     
//     return styles;
//   }
// } 