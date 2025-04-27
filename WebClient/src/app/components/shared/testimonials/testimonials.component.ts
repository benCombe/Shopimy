import { Component, Input, OnInit } from '@angular/core';
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
export class TestimonialsComponent implements OnInit {
  @Input() storeData: StoreDetails | null = null;
  @Input() theme: StoreTheme | null = null;
  @Input() isPreview = false;
  
  // Define properties used in the template
  testimonials: any[] = [];
  loading = false;
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

  getThemeStyles(): Record<string, string> {
    const styles: Record<string, string> = {};
    
    if (this.theme) {
      // Apply direct background style
      styles['background-color'] = this.theme.thirdColor || '#D3CEBB';
      
      // Testimonials section specific variables
      styles['--testimonials-bg'] = this.theme.thirdColor || '#D3CEBB';
      styles['--testimonials-text-color'] = this.theme.mainColor || '#393727';
      styles['--testimonials-heading-color'] = this.theme.mainColor || '#393727';
      styles['--testimonials-heading-underline'] = this.theme.secondColor || '#D0933D';
      styles['--testimonials-author-color'] = this.theme.secondColor || '#D0933D';
      styles['--testimonials-card-bg'] = this.theme.altColor || '#FFFFFF';
      styles['--testimonials-card-shadow'] = 'rgba(0, 0, 0, 0.1)';
    } else if (this.storeData) {
      // Apply direct background style
      styles['background-color'] = this.storeData.theme_3 || '#D3CEBB';
      
      // Testimonials section specific variables
      styles['--testimonials-bg'] = this.storeData.theme_3 || '#D3CEBB';
      styles['--testimonials-text-color'] = this.storeData.theme_1 || '#393727';
      styles['--testimonials-heading-color'] = this.storeData.theme_1 || '#393727';
      styles['--testimonials-heading-underline'] = this.storeData.theme_2 || '#D0933D';
      styles['--testimonials-author-color'] = this.storeData.theme_2 || '#D0933D';
      styles['--testimonials-card-bg'] = this.storeData.fontColor || '#FFFFFF';
      styles['--testimonials-card-shadow'] = 'rgba(0, 0, 0, 0.1)';
    }
    
    return styles;
  }
} 