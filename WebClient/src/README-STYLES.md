# Shopimy Standardized Styles

This document outlines the standardized styles and components available across the Shopimy application. Following these guidelines will ensure a consistent user experience throughout the application.

## Table of Contents
1. [Scrollable Containers](#scrollable-containers)
2. [Buttons](#buttons)
3. [Tables](#tables)
4. [Status Badges](#status-badges)
5. [Empty States](#empty-states)
6. [Responsive Design](#responsive-design)

## Scrollable Containers

All scrollable containers now use consistent scrollbar styling and behavior:

```css
.table-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.03);
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color);
  max-height: calc(100vh - 200px);
  padding: 0;
  margin-bottom: 16px;
}
```

### Usage

Wrap any table or scrollable content in a `.table-container` div:

```html
<div class="table-container">
  <table class="standard-table">
    <!-- Table content -->
  </table>
</div>
```

## Buttons

Use the standardized button classes for consistent button styling:

```css
.standard-button {
  padding: 8px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 25px;
  background-color: var(--main-color);
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  white-space: nowrap;
  min-height: 40px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

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

## Tables

Use the standardized table classes for consistent table styling:

```css
.standard-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 650px;
}
```

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

## Status Badges

Use status badges to indicate the status of an item:

```css
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
  white-space: nowrap;
}
```

### Status Badge Variants

- `.status-shipped` - Blue badge for shipped items
- `.status-delivered` - Green badge for delivered items
- `.status-pending` - Orange badge for pending items
- `.status-cancelled` - Red badge for cancelled items
- `.status-processing` - Purple badge for processing items

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

```css
.empty-state {
  padding: 30px 24px;
  text-align: center;
  color: #777;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-height: 150px;
  justify-content: center;
}
```

### Usage

```html
<div class="empty-state">
  <i class="fa-solid fa-inbox"></i>
  <p>No items found</p>
</div>
```

## Responsive Design

All components are designed to be responsive out of the box. The following breakpoints are used:

- Small devices (landscape phones): 576px
- Medium devices (tablets): 768px
- Large devices (desktops): 992px
- Extra large devices (large desktops): 1200px
- Extra extra large devices: 1400px

### Landscape Mode Optimization

Special optimizations are included for landscape mode on mobile devices:

```css
@media (orientation: landscape) and (max-height: 500px) {
  /* Optimizations for landscape mode */
}
```

## Using Scroll Indicators

For tables that may have horizontal scrolling, you can add a scroll indicator:

```html
<div class="table-container">
  <div class="scroll-indicator">
    <i class="fa-solid fa-arrows-left-right"></i>
  </div>
  <table class="standard-table">
    <!-- Table content -->
  </table>
</div>
```

## CSS Variables

The application uses the following CSS variables for consistent styling:

```css
:root {
  --main-color: #393727;
  --second-color: #D0933D;
  --third-color: #D3CEBB;
  --alt-color: #d5d5d5;
  --main-font-fam: "Inria Serif", serif;
  --scrollbar-width: 8px;
  --scrollbar-height: 8px;
  --scrollbar-track-color: rgba(0, 0, 0, 0.05);
  --scrollbar-thumb-color: var(--main-color);
  --scrollbar-border-radius: 4px;
}
```

## Best Practices

1. Always use the standardized classes when possible
2. Ensure tables have proper horizontal and vertical scrolling
3. Add minimum widths to table columns to prevent content squishing
4. Optimize for landscape mode where appropriate
5. Always test your changes on multiple device sizes
6. Use the appropriate status badges for different states
7. Add empty states when no data is available 