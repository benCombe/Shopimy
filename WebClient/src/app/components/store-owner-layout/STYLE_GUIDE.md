# Store Owner Layout Style Guide

This document outlines the standardized styling for the Store Owner dashboard components. All components within the store-owner-layout should follow these guidelines for consistency across the application.

## CSS Variables

All components inherit CSS variables from the root stylesheet (`store-owner-layout.component.css`). These variables should be used instead of hardcoded values.

### Spacing

```css
--spacing-xs: 0.5rem;   /* 8px */
--spacing-sm: 0.75rem;  /* 12px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */
--spacing-xxl: 3rem;    /* 48px */
```

### Colors

Use the main color variables:
```css
var(--main-color)
var(--second-color)
var(--third-color)
```

For text and status colors:
```css
--color-text-primary: var(--main-color);
--color-text-secondary: rgba(0, 0, 0, 0.7);
--color-text-tertiary: rgba(0, 0, 0, 0.5);
--color-text-on-surface: #444;

--color-success: #16a34a;
--color-warning: #ca8a04;
--color-error: #e02424;
--color-info: #3b82f6;
```

### Shadows and Borders

```css
--shadow-sm: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-focus: 0 0 0 2px rgba(208, 147, 61, 0.2);

--border-radius: 8px;
--border-radius-lg: 12px;
--border-radius-xl: 16px;

--border-color-light: rgba(0, 0, 0, 0.1);
--border-color: #d1d5db;
```

## Component Structure

### Page Layout

For a standard page layout, use the following structure:

```html
<div class="dashboard-container">
  <div class="page-header">
    <h1>Page Title</h1>
    <p>Description of the page</p>
  </div>
  
  <div class="section">
    <div class="section-header">
      <h2>Section Title</h2>
      <button class="standard-button">Action</button>
    </div>
    
    <!-- Section content goes here -->
  </div>
</div>
```

### Dashboard Cards

For dashboard statistics or summary cards:

```html
<div class="dashboard-container">
  <div class="dashboard-wrapper">
    <div class="dashboard-card">
      <div class="card-header">
        <h2>Card Title</h2>
      </div>
      <div class="card-content">
        <!-- Card content goes here -->
      </div>
    </div>
  </div>
</div>
```

### Tables

For data tables, use the following structure:

```html
<div class="table-container">
  <table class="standard-table">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
        <!-- More headers -->
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
        <!-- More data -->
      </tr>
      <!-- More rows -->
    </tbody>
  </table>
</div>
```

### Forms

For forms, use the following structure:

```html
<form>
  <div class="form-group">
    <label for="fieldId">Field Label</label>
    <input id="fieldId" type="text" />
    <!-- Optional error message -->
    <div class="error-message">Error message</div>
  </div>
  
  <!-- For multi-column layout -->
  <div class="form-row">
    <div class="form-group">
      <!-- Field 1 -->
    </div>
    <div class="form-group">
      <!-- Field 2 -->
    </div>
  </div>
  
  <div class="form-actions">
    <button type="submit" class="standard-button">Submit</button>
    <button type="button" class="standard-button secondary">Cancel</button>
  </div>
</form>
```

### Status Badges

For displaying status information:

```html
<span class="status-badge success">Active</span>
<span class="status-badge warning">Pending</span>
<span class="status-badge error">Failed</span>
<span class="status-badge info">Processing</span>
```

### Loading & Empty States

For loading state:

```html
<div class="loading-container">
  <div class="loading-spinner"></div>
</div>
```

For empty state:

```html
<div class="empty-state">
  <i class="fa fa-info-circle"></i>
  <p>No data available</p>
  <div class="empty-state-sub">Try changing your search criteria</div>
</div>
```

### Statistics

For displaying statistics:

```html
<div class="stats-grid">
  <div class="stat-item">
    <span class="stat-label">Total Orders</span>
    <span class="stat-value">245</span>
  </div>
  <div class="stat-item">
    <span class="stat-label">Total Revenue</span>
    <span class="stat-value">$12,345</span>
  </div>
</div>
```

## Responsive Design

All components should be responsive by default. The shared CSS includes media queries for different screen sizes:

- Large screens (992px+): Default desktop layout
- Medium screens (768px-992px): Reduced spacing, single column layout
- Small screens (480px-768px): Further reduced spacing and font sizes
- Extra small screens (<480px): Minimal spacing, simplified layouts

## Animation

Use the provided fade-in animation for new content:

```html
<div class="fade-in">
  <!-- Content to animate -->
</div>
```

## Additional Guidelines

1. Always use the standardized CSS classes rather than creating new ones
2. Keep component-specific CSS to a minimum
3. For component-specific styling that can't be handled by the standard classes, use CSS scoped to your component
4. When in doubt, refer to existing components for styling patterns 