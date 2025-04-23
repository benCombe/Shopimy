# Shared Components for Store Pages

This directory contains reusable components used for both the live store page and the store preview in the editor.

## Components Overview

### StoreHeaderComponent
Displays the store logo and name, with seamless integration with the hero banner.

### HeroBannerComponent
Shows a prominent banner at the top of the page with customizable text.

### FeaturedProductsComponent
Displays a grid of featured products, with preview mode for the editor and real product loading for the live store.

### TestimonialsComponent
Shows customer testimonials with styling consistent with the overall theme.

### NewsletterComponent
Provides a newsletter signup form with email validation.

### StoreFooterComponent
Displays a simple footer with copyright information.

## Implementation Notes

1. **Consistent Theming**: All components use the same theming approach, accepting either a `StoreTheme` object or falling back to `StoreData` properties.

2. **Responsive Design**: Components are designed to work across all device sizes, with specific adjustments for mobile, tablet, and desktop.

3. **Accessibility**: ARIA attributes are added to ensure components are accessible to users with disabilities.

4. **Conditional Rendering**: Components are conditionally rendered based on the `componentVisibility` settings.

5. **DRY Principle**: Components are designed to be reused across the application, avoiding code duplication.

## Usage

```html
<!-- Example: Using the hero banner component -->
<app-hero-banner 
  *ngIf="storeData?.componentVisibility?.hero" 
  [storeData]="storeData"
  [theme]="theme">
</app-hero-banner>

<!-- Example: Using the store header component -->
<app-store-header 
  *ngIf="storeData?.componentVisibility?.header" 
  [storeData]="storeData"
  [theme]="theme">
</app-store-header>
```

## Future Improvements

1. **Enhanced Customization**: Add more customization options for each component.
2. **Performance Optimization**: Implement OnPush change detection for better performance.
3. **Animation Support**: Add support for animations and transitions between components.
4. **More Empty States**: Improve empty state handling for all components. 