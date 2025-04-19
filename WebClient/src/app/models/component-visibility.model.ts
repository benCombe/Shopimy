export interface ComponentVisibility {
  header: boolean;
  hero: boolean;
  featured: boolean;
  categories: boolean;
  testimonials: boolean;
  newsletter: boolean;
  footer: boolean;
}

// Default visibility settings
export const DEFAULT_VISIBILITY: ComponentVisibility = {
  header: true,
  hero: true,
  featured: true,
  categories: true,
  testimonials: true,
  newsletter: true,
  footer: true
}; 