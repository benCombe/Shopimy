# Shopimy Standardized Styles & Component Guide

This document outlines the standardized styles, components, and UI patterns to be used across the Shopimy application. Following these guidelines will ensure a consistent user experience throughout the application.

## Table of Contents
1. [CSS Variables](#css-variables)
2. [Buttons](#buttons)
3. [Tables](#tables)
4. [Cards](#cards)
5. [Form Elements](#form-elements)
6. [Status Badges](#status-badges)
7. [Empty States](#empty-states)
8. [Loading Indicators](#loading-indicators)
9. [Layouts & Grids](#layouts--grids)
10. [Responsive Design](#responsive-design)
11. [Typography](#typography)
12. [Utility Classes](#utility-classes)
13. [Accessibility Guidelines](#accessibility-guidelines)

## CSS Variables

All components should use these CSS variables for consistent styling:

```css
:root {
  --main-color: #393727;
  --second-color: #D0933D;
  --third-color: #D3CEBB;
  --alt-color: #d5d5d5;
  --main-font-fam: "Inria Serif", serif;
  
  /* Scrollbars */
  --scrollbar-width: 8px;
  --scrollbar-height: 8px;
  --scrollbar-track-color: rgba(0, 0, 0, 0.05);
  --scrollbar-thumb-color: var(--main-color);
  --scrollbar-border-radius: 4px;
  
  /* Breakpoints */
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  --breakpoint-xxl: 1400px;
}
```

## Buttons

Use the standardized button classes for consistent button styling:

### Button Variants

- `.standard-button` - Default button
- `.standard-button.primary` - Primary action button
- `.standard-button.secondary` - Secondary action button
- `.standard-button.small` - Small button
- `.standard-button.large` - Large button
- `.standard-button.full-width` - Full-width button

### Usage

```html
<button class="standard-button">Default Button</button>
<button class="standard-button primary">Primary Button</button>
<button class="standard-button secondary">Secondary Button</button>
<button class="standard-button small">Small Button</button>
<button class="standard-button large">Large Button</button>
<button class="standard-button full-width">Full Width Button</button>
```

### Accessibility

Always include an `aria-label` attribute when the button's purpose isn't clear from its text:

```html
<button class="standard-button" aria-label="Close modal">✕</button>
```

## Tables

Use the standardized table classes for consistent table styling:

### Usage

```html
<div class="table-container">
  <table class="standard-table">
    <thead>
      <tr>
        <th>Header 1</th>
        <th>Header 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

For action buttons in tables, use:

```html
<td class="actions-cell">
  <button class="standard-button small" aria-label="Edit item">Edit</button>
  <button class="standard-button small" aria-label="Delete item">Delete</button>
</td>
```

## Cards

Use the dashboard card class for consistent card styling:

```html
<div class="dashboard-card">
  <div class="card-header">
    <h2>Card Title</h2>
  </div>
  <div class="card-content">
    <!-- Card content goes here -->
  </div>
</div>
```

## Form Elements

### Form Groups

Wrap form elements in a `.form-group` for consistent styling:

```html
<div class="form-group">
  <label for="name">Name</label>
  <input 
    id="name" 
    type="text" 
    [class.error]="form.get('name')?.invalid && form.get('name')?.touched"
    aria-required="true">
  <div class="error-message" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
    Error message goes here
  </div>
</div>
```

### Form Rows

For multi-column forms, use `.form-row`:

```html
<div class="form-row">
  <div class="form-group">
    <!-- First form group -->
  </div>
  <div class="form-group">
    <!-- Second form group -->
  </div>
</div>
```

### Form Actions

For form action buttons, use `.form-actions`:

```html
<div class="form-actions">
  <button type="button" class="standard-button secondary">Cancel</button>
  <button type="submit" class="standard-button primary">Submit</button>
</div>
```

## Status Badges

Use status badges to indicate the status of an item:

### Status Badge Variants

- `.status-badge.status-shipped` - Blue badge for shipped items
- `.status-badge.status-delivered` - Green badge for delivered items
- `.status-badge.status-pending` - Orange badge for pending items
- `.status-badge.status-cancelled` - Red badge for cancelled items
- `.status-badge.status-processing` - Purple badge for processing items

### Usage

```html
<span class="status-badge status-shipped">Shipped</span>
<span class="status-badge status-delivered">Delivered</span>
<span class="status-badge status-pending">Pending</span>
<span class="status-badge status-cancelled">Cancelled</span>
<span class="status-badge status-processing">Processing</span>
```

## Empty States

Use the empty state class for consistent empty state styling:

```html
<div class="empty-state">
  <i class="fa fa-inbox" aria-hidden="true"></i>
  <p>No items found</p>
</div>
```

## Loading Indicators

Use the loading container and spinner for consistent loading state styling:

```html
<div class="loading-container">
  <div class="loading-spinner" aria-hidden="true"></div>
  <p>Loading...</p>
</div>
```

For inline loading indicators (e.g., within buttons), use:

```html
<span class="saving-indicator">
  <div class="spinner-small"></div> Saving...
</span>
```

## Layouts & Grids

For dashboard layouts, use:

```html
<div class="dashboard-grid">
  <div class="dashboard-card"><!-- Card 1 --></div>
  <div class="dashboard-card"><!-- Card 2 --></div>
  <div class="dashboard-card"><!-- Card 3 --></div>
</div>
```

For flexible grid layouts, use:

```html
<div class="grid grid-2 grid-md-3 grid-lg-4">
  <div><!-- Item 1 --></div>
  <div><!-- Item 2 --></div>
  <div><!-- Item 3 --></div>
  <div><!-- Item 4 --></div>
</div>
```

## Responsive Design

All components are designed to be responsive. Use these breakpoints:

```css
@media (min-width: 576px) { /* Small devices */ }
@media (min-width: 768px) { /* Medium devices */ }
@media (min-width: 992px) { /* Large devices */ }
@media (min-width: 1200px) { /* Extra large devices */ }
@media (min-width: 1400px) { /* Extra extra large devices */ }
```

## Typography

Use these text size classes for consistent typography:

```html
<p class="text-sm">Small text (0.875rem)</p>
<p class="text-md">Medium text (1rem)</p>
<p class="text-lg">Large text (1.125rem)</p>
<p class="text-xl">Extra large text (1.25rem)</p>
```

## Utility Classes

### Alignment & Positioning

```html
<div class="center">Centered content (flex)</div>
<div class="center-spaced">Centered with space-between (flex)</div>
<div class="center-col">Centered column (flex)</div>
```

### Responsive Visibility

```html
<div class="hide-sm">Hidden on small devices</div>
<div class="hide-md">Hidden on medium devices</div>
<div class="hide-lg">Hidden on large devices</div>
<div class="show-sm">Visible only on small devices</div>
<div class="show-md">Visible only on medium devices</div>
<div class="show-lg">Visible only on large devices</div>
```

## Accessibility Guidelines

1. **Always use proper HTML semantics** - Use appropriate HTML elements for their intended purpose.
2. **Include ARIA attributes** - Use `aria-label`, `aria-labelledby`, `aria-hidden`, etc., when necessary.
3. **Ensure keyboard navigability** - All interactive elements should be accessible via keyboard.
4. **Support screen readers** - Use proper ARIA roles and attributes for complex components.
5. **Consider color contrast** - Ensure text has sufficient contrast against its background.
6. **Support reduced motion** - Use the `prefers-reduced-motion` media query to respect user preferences.

### Example:

```html
<button 
  class="standard-button" 
  aria-label="Close dialog" 
  (click)="closeDialog()" 
  [disabled]="isProcessing">
  <span *ngIf="isProcessing" class="saving-indicator">
    <div class="spinner-small" aria-hidden="true"></div> Processing...
  </span>
  <span *ngIf="!isProcessing">Close</span>
</button>
```

## Best Practices

1. Always use the standardized classes when possible
2. Ensure tables have proper horizontal and vertical scrolling
3. Add minimum widths to table columns to prevent content squishing
4. Use proper ARIA attributes for accessibility
5. Test all components on different screen sizes
6. Ensure keyboard navigability
7. Use proper color contrast for text
8. Follow the established patterns for new components 