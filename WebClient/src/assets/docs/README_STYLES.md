# Shopimy Design System & Component Guide

This guide defines the visual style, CSS variables, and common component styling patterns for the Shopimy application. It aims to ensure a cohesive look and feel across the entire application.

---

## 1. Core Theme & CSS Variables

The foundation of the Shopimy visual style is defined in `src/styles.css` using CSS variables. Developers should **always** prefer using these variables over hardcoded values to maintain consistency and allow for easier theme updates.

```css
/* src/styles.css */
:root {
  /* Primary Color Palette (Dark Olive/Mustard/Tan) */
  --main-color: #393727;        /* Dark olive - Primary background, text on light surfaces */
  --second-color: #D0933D;       /* Mustard - Accents, highlights, buttons */
  --third-color: #D3CEBB;        /* Light tan - Card backgrounds, secondary surfaces */
  --alt-color: #d5d5d5;          /* Light gray - Alternative background or subtle elements */

  /* Text Colors */
  --color-text-on-primary: #FFFFFF; /* White text for use on --main-color backgrounds */
  --color-text-on-surface: #393727; /* Dark text for use on --third-color or light backgrounds */
  --color-text-light: #6b7280;     /* Lighter text for hints, placeholders */

  /* Feedback Colors */
  --color-error: #e02424;          /* Red for errors/invalid states */
  --color-error-light: #fde8e8;    /* Light red background for error messages */
  --color-success: #059669;        /* Green for success states */
  --color-success-light: #e8f5e9;  /* Light green background */
  --color-warning: #e65100;        /* Orange for warnings */
  --color-warning-light: #fff3e0;  /* Light orange background */
  --color-info: #1565c0;           /* Blue for informational messages */
  --color-info-light: #e3f2fd;     /* Light blue background */
  --color-pending: #4527a0;        /* Purple for pending states */
  --color-pending-light: #ede7f6;  /* Light purple background */

  /* Typography */
  --main-font-fam: "Inria Serif", serif; /* Primary font */

  /* Borders & Spacing */
  --border-radius: 8px;            /* Standard border radius for cards, inputs */
  --border-radius-lg: 12px;         /* Larger border radius */
  --border-radius-round: 50%;       /* Fully rounded */
  --border-color: #d1d5db;         /* Standard border color */
  
  /* Spacing units are used for consistent padding and margins */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;

  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
  --shadow-focus: 0 0 0 2px rgba(208, 147, 61, 0.2); /* Focus ring */

  /* Scrollbars */
  --scrollbar-width: 8px;
  --scrollbar-height: 8px;
  --scrollbar-track-color: rgba(0, 0, 0, 0.05);
  --scrollbar-thumb-color: var(--main-color);
  --scrollbar-border-radius: 4px;
  
  /* Breakpoints */
  --breakpoint-sm: 576px;  /* Small devices (landscape phones) */
  --breakpoint-md: 768px;  /* Medium devices (tablets) */
  --breakpoint-lg: 992px;  /* Large devices (desktops) */
  --breakpoint-xl: 1200px; /* Extra large devices (large desktops) */
}
```

When using these variables, always include fallback values for older browsers:

```css
/* Correct */
color: var(--color-error, #e02424);

/* Instead of */
color: var(--color-error);
```

---

## 2. Global Styles & Utility Classes

Defined in `src/styles.css`, these styles provide the foundation for the entire application:

### 2.1 Base Styles

* **HTML/Body:** Sets default `background-color` (`--alt-color`), `color` (`--main-color`), and `font-family` (`--main-font-fam`). Includes custom scrollbar styling.
* **Typography:** Standard text sizes and responsive scaling.
* **Box Model:** Default `box-sizing: border-box` for all elements.

### 2.2 Layout Containers

* **`.global-container`:** Full-width, min-height container for page-level content.
* **`.global-main`:** Centered flex container with `--main-color` background.
* **`.content-wrapper`:** Standard padding and max-width for content sections.
* **`.full-width-container`:** Container that spans the entire viewport width.

### 2.3 Utility Classes

* **Flex Utilities:**
  * **`.center`:** `display: flex; align-items: center; justify-content: center;`
  * **`.center-col`:** Flex column version of `.center`.
  * **`.center-spaced`:** `display: flex; align-items: center; justify-content: space-between;`

* **Grid Utilities:**
  * **`.grid`:** Base grid container.
  * **`.grid-[1-4]`:** Grid with 1-4 columns.
  * **`.grid-[sm|md|lg]-[1-4]`:** Responsive grid layouts.

* **Text Utilities:**
  * **`.text-[sm|md|lg|xl]`:** Text size variations.
  * **`.text-truncate`:** Truncates text with ellipsis.
  * **`.text-break`:** Allows text to break at any character.

* **Visibility Utilities:**
  * **`.hide-[sm|md|lg]`:** Hide at specific breakpoints.
  * **`.show-[sm|md|lg]`:** Show at specific breakpoints.

* **Empty State:**
  * **`.empty-state`:** Styling for empty content states with icon and text.

---

## 3. Component Styles

### 3.1 Buttons

* **Standard Button (`.standard-button`):** The base button class used across the application.
  * **Primary (Default):** `background: var(--main-color); color: var(--second-color);`
  * **Secondary (`.secondary`):** `background: var(--second-color); color: var(--main-color);`
  * **Sizes:**
    * **Default:** Default sizing (padding, height, font-size)
    * **Small (`.small`):** Smaller version for compact UIs.
    * **Large (`.large`):** Larger version for prominent actions.
  * **Width:**
    * **Default:** Auto width based on content.
    * **Full Width (`.full-width`):** `width: 100%` for mobile or form actions.
  * **States:**
    * **Hover:** Scale and shadow changes.
    * **Focus:** Outline styles for accessibility.
    * **Disabled:** Grayed out appearance.

**Example:**
```html
<button class="standard-button">Default Button</button>
<button class="standard-button secondary">Secondary Button</button>
<button class="standard-button small">Small Button</button>
<button class="standard-button large full-width">Large Full Width</button>
```

### 3.2 Form Elements

* **Form Containers:**
  * **Card Containers:** Card-like containers (`.global-card`) with padding, border-radius, and shadows.
  * **Form Groups:** Container for label and input with proper spacing.

* **Inputs:**
  * **Default:** Standard styling with border, padding, and focus states.
  * **States:**
    * **Focus:** Border color changes and shadow appears.
    * **Invalid:** Red border and error message.
  * **Special Inputs:**
    * **Password:** Toggle visibility button.
    * **Dropdown:** Custom styling for select elements.
    * **Checkbox/Radio:** Custom styled elements.

* **Error Messages:**
  * **`.invalid-feedback`, `.error-message`:** Red text for validation errors.

### 3.3 Cards & Containers

* **Basic Cards:**
  * **`.global-card`:** Standard card with padding, border-radius, background, and shadow.
  * **`.dashboard-card`:** Similar to global card with specific dashboard styling.
  * **`.safe-card`:** Card with additional safety features for important content.

* **Product Cards:**
  * **`.item-card`:** Used for displaying product items, with consistent image size, information display, and interaction states.

* **Feature Cards:**
  * **`.feature-card`:** Used for showcasing features with accent colors and hover effects.

### 3.4 Navigation & Page Structure

* **Top Navigation:**
  * **Main Bar:** Full-width bar with logo and navigation items.
  * **Logo:** Prominent branding element.
  * **Nav Items:** Consistent spacing and hover effects.
  * **Dropdowns:** Standardized dropdown styling across the app.
  * **Mobile Menu:** Collapsible menu for small screens.

* **Footer:**
  * **`.footer-container`:** Full-width footer with consistent spacing.
  * **Sections:** Multiple columns for different content types.
  * **Links:** Standard styling for footer links.
  * **Social Icons:** Consistent styling for social media links.

### 3.5 Status & Feedback Elements

* **Status Badges (`.status-badge`):**
  * **`.status-shipped`, `.status-delivered`, etc.:** Color-coded badges for different states.

* **Alert Messages:**
  * **`.alert`, `.alert-[type]`:** Contextual message styling (error, success, info, warning).

* **Loading States:**
  * **Loading spinners and placeholders with consistent styling.

---

## 4. Component Patterns

Based on our style audit, we've identified these common patterns that should be followed:

### 4.1 Component Structure

* **Container → Header → Content → Footer:** Most components follow this general structure.
* **Standalone Components:** Typically use `.global-container` as a wrapper.
* **Card-based Components:** Use consistent card structure with proper padding and spacing.

### 4.2 Interactive Element Patterns

* **Hover Effects:** Scale transforms (`transform: translateY(-5px)`) and shadow enhancements.
* **Focus States:** Visible outlines using `--shadow-focus` for accessibility.
* **Active/Selected States:** Background color changes and subtle visual cues.

### 4.3 Responsive Patterns

* **Mobile-First Approach:** Start with mobile design and expand for larger screens.
* **Breakpoint Usage:** Consistent use of breakpoint variables.
* **Layout Changes:**
  * Cards switch from multi-column to single column.
  * Navigation collapses to hamburger menu.
  * Font sizes adjust appropriately.
  * Padding and margins scale down.

### 4.4 Form Patterns

* **Label → Input → Error Message:** Consistent vertical stacking.
* **Validation Feedback:** Immediate visual feedback (colors, icons).
* **Submit Buttons:** Full-width on mobile, auto-width on desktop.

---

## 5. Responsiveness

The application uses a mobile-first approach with standardized breakpoints:

```css
/* Mobile first - styles defined for smallest screens */

@media (min-width: 576px) {
  /* Small devices (landscape phones) */
}

@media (min-width: 768px) {
  /* Medium devices (tablets) */
}

@media (min-width: 992px) {
  /* Large devices (desktops) */
}

@media (min-width: 1200px) {
  /* Extra large devices */
}
```

Key responsive behaviors:
* **Grids:** Change from single column to multi-column.
* **Typography:** Scale font sizes up at larger breakpoints.
* **Navigation:** Switch between mobile menu and desktop navigation.
* **Containers:** Adjust max-width and padding.
* **Forms:** Adjust layout (e.g., from stacked to side-by-side).

---

## 6. Accessibility

Always consider accessibility when implementing styles:

* **Color Contrast:** Maintain WCAG AA (minimum) contrast ratios.
* **Focus States:** Make focus indicators clearly visible.
* **Semantic HTML:** Use appropriate HTML elements for their intended purpose.
* **Screen Reader Support:** Use proper ARIA attributes and ensure content is accessible.
* **Keyboard Navigation:** Ensure all interactive elements can be accessed and used with keyboard.

---

## 7. Best Practices

### 7.1 CSS Organization

* **Component Scope:** Keep styles specific to a component within its component CSS file.
* **Global Styles:** Only add styles to `src/styles.css` if they truly apply globally.
* **Specificity:** Keep specificity low; prefer classes over IDs for styling.
* **Naming:** Use descriptive class names that indicate the component's purpose.

### 7.2 Implementation

* **Variables First:** Always use defined CSS variables for colors, spacing, etc.
* **Utility Classes:** Use the standard utility classes instead of redefining common patterns.
* **Responsive Design:** Test components at all breakpoints.
* **Cross-Browser:** Test in multiple browsers to ensure consistent appearance.

### 7.3 Fallbacks

* **CSS Variables:** Always include fallback values for older browsers: `var(--color, #fallback)`.
* **Complex Properties:** Provide fallbacks for modern CSS features when necessary.

---

## 8. Common Components Reference

| Component | Style Source | Example Usage |
|-----------|--------------|--------------|
| Standard Button | `styles.css` | `<button class="standard-button">Button</button>` |
| Cards | `styles.css`, Component CSS | `<div class="global-card">Content</div>` |
| Forms | Component CSS | `LoginComponent` | `RegisterComponent` |
| Navigation | `top-nav.component.css` | See `TopNavComponent` |
| Footer | `footer.component.css` | See `FooterComponent` |
| Status Badges | `styles.css` | `<span class="status-badge status-shipped">Shipped</span>` |

---

By adhering to this guide, developers can ensure the Shopimy application maintains a consistent, professional, and maintainable user interface.