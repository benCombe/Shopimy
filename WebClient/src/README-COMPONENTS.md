# Shared Components Documentation

This document outlines the shared components used across the Shopimy application, particularly for the store pages and store preview.

## Store Components

These components provide a consistent UI between the live store page and the store preview in the editor.

### HeroBannerComponent

Displays the banner section at the top of the store.

**Inputs:**
- `storeData: StoreDetails | null` - The store data containing banner information
- `theme: StoreTheme | null` - Optional theme override for the component

**Usage:**
```html
<app-hero-banner 
  [storeData]="storeData" 
  [theme]="theme">
</app-hero-banner>
```

### StoreHeaderComponent

Displays the store logo and name.

**Inputs:**
- `storeData: StoreDetails | null` - The store data containing logo and name
- `theme: StoreTheme | null` - Optional theme override for the component

**Usage:**
```html
<app-store-header 
  [storeData]="storeData" 
  [theme]="theme">
</app-store-header>
```

### FeaturedProductsComponent

Displays a grid of featured products.

**Inputs:**
- `storeData: StoreDetails | null` - The store data with ID for loading products
- `theme: StoreTheme | null` - Optional theme override for the component
- `isPreview: boolean` - Whether to show preview placeholder products (default: false)

**Usage:**
```html
<app-featured-products 
  [storeData]="storeData"
  [theme]="theme"
  [isPreview]="false">
</app-featured-products>
```

### TestimonialsComponent

Displays customer testimonials.

**Inputs:**
- `storeData: StoreDetails | null` - The store data
- `theme: StoreTheme | null` - Optional theme override for the component

**Usage:**
```html
<app-testimonials 
  [storeData]="storeData" 
  [theme]="theme">
</app-testimonials>
```

### NewsletterComponent

Displays a newsletter signup form.

**Inputs:**
- `storeData: StoreDetails | null` - The store data
- `theme: StoreTheme | null` - Optional theme override for the component

**Usage:**
```html
<app-newsletter 
  [storeData]="storeData" 
  [theme]="theme">
</app-newsletter>
```

### StoreFooterComponent

Displays the footer with copyright information.

**Inputs:**
- `storeData: StoreDetails | null` - The store data with store name
- `theme: StoreTheme | null` - Optional theme override for the component

**Usage:**
```html
<app-store-footer 
  [storeData]="storeData" 
  [theme]="theme">
</app-store-footer>
```

## Integration

These components are used in both the `StorePageComponent` and `StorePreviewComponent` to ensure a consistent look and feel between the live store and preview.

To use these components, make sure to include them in the imports array of your component:

```typescript
@Component({
  // ...
  imports: [
    CommonModule,
    HeroBannerComponent,
    StoreHeaderComponent,
    FeaturedProductsComponent,
    TestimonialsComponent,
    NewsletterComponent,
    StoreFooterComponent
  ],
  // ...
})
```

And conditionally render them based on the store's `componentVisibility` settings:

```html
<app-hero-banner 
  *ngIf="storeData?.componentVisibility?.hero" 
  [storeData]="storeData">
</app-hero-banner>
```

## Theming

All components support theming via the following CSS variables:

- `--main-color` - Primary color (typically dark)
- `--second-color` - Secondary color (typically accent)
- `--third-color` - Tertiary color (typically light background)
- `--alt-color` - Text color for contrast
- `--main-font-fam` - Font family

These variables can be set globally on the `:root` element or passed directly to the components via the `theme` input. 