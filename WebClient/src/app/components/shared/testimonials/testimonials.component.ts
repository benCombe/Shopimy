import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDetails } from '../../../models/store-details';
import { StoreTheme } from '../../../models/store-theme.model';
import { LoadingOneComponent } from '../../utilities/loading-one/loading-one.component';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, LoadingOneComponent],
  templateUrl: './testimonials.component.html',
  styleUrls: [
    './testimonials.component.css',
    '../styles/section-headings.css'
  ]
})
export class TestimonialsComponent {
  @Input() storeData: StoreDetails | null = null;
  @Input() theme: StoreTheme | null = null;
  @Input() isPreview: boolean = false;
  
  // Define properties used in the template
  testimonials: any[] = [];
  loading: boolean = false;
  sampleTestimonials: any[] = [
    { text: '"This store is amazing! Great products and service."', author: 'Happy Customer' },
    { text: '"Excellent quality and fast shipping."', author: 'Satisfied Shopper' },
    { text: '"Will definitely buy from here again!"', author: 'Repeat Buyer' }
  ];

  // Simple testimonial data - In a real app, this would come from an API
  // testimonial = {
  //   text: '"This store is amazing! Great products and service."',
  //   author: 'Happy Customer'
  // };
  
  // TODO: Implement fetching logic for actual testimonials
  ngOnInit(): void {
    if (!this.isPreview) {
      // this.fetchTestimonials(); 
    }
  }

  // fetchTestimonials(): void {
  //   this.loading = true;
  //   // Replace with actual service call
  //   setTimeout(() => {
  //     this.testimonials = [
  //        { text: '"Fetched testimonial 1."', author: 'Real User 1' },
  //        { text: '"Fetched testimonial 2."', author: 'Real User 2' }
  //      ];
  //     this.loading = false;
  //   }, 1500);
  // }

  getThemeStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    
    if (this.theme) {
      styles['--testimonials-bg'] = this.theme.thirdColor || '#D3CEBB';
      styles['--testimonials-text-color'] = this.theme.mainColor || '#393727';
    } else if (this.storeData) {
      styles['--testimonials-bg'] = this.storeData.theme_3;
      styles['--testimonials-text-color'] = this.storeData.theme_1;
    }
    
    return styles;
  }
} 