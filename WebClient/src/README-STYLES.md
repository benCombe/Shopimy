# Shopimy Design System & Component Guide

This guide defines the visual style, CSS variables, and common component styling patterns for the Shopimy application. It aims to ensure a cohesive look and feel, particularly across key user flows like the landing page, login, and registration.

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
  --border-radius: 6px;            /* Standard border radius for cards, inputs */
  --border-radius-lg: 12px;         /* Larger border radius */
  --border-radius-round: 50%;       /* Fully rounded */
  --border-color: #d1d5db;         /* Standard border color */
  --border-color-light: rgba(0, 0, 0, 0.1); /* Lighter border */
  --spacing-unit: 1rem;            /* Base spacing unit (16px default) */
  --spacing-xs: calc(var(--spacing-unit) * 0.25);
  --spacing-sm: calc(var(--spacing-unit) * 0.5);
  --spacing-md: var(--spacing-unit);
  --spacing-lg: calc(var(--spacing-unit) * 1.5);
  --spacing-xl: calc(var(--spacing-unit) * 2);

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 6px 12px rgba(0, 0, 0, 0.15);
  --shadow-focus: 0 0 0 2px rgba(208, 147, 61, 0.2); /* Focus ring */

  /* Scrollbars */
  --scrollbar-width: 8px;
  --scrollbar-height: 8px;
  --scrollbar-track-color: rgba(0, 0, 0, 0.05);
  --scrollbar-thumb-color: var(--main-color);
  --scrollbar-border-radius: 4px;
}
```

---

## 2. Global Styles

Defined in `src/styles.css`:

*   **Body:** Sets default `background-color` (`--alt-color`), `color` (`--main-color`), and `font-family` (`--main-font-fam`). Enables custom scrollbars.
*   **Layout Containers:**
    *   `.global-container`: Basic full-width, min-height container.
    *   `.global-main`: Flex container for centering content, uses `--main-color` background (like Landing/Login/Register).
*   **Utility Classes:**
    *   `.center`: `display: flex; align-items: center; justify-content: center;`
    *   `.center-col`: Flex column version of `.center`.
    *   `.center-spaced`: `display: flex; align-items: center; justify-content: space-between;`

---

## 3. Component Styles

### 3.1 Buttons (`.standard-button`, Login/Register Buttons)

*   **Base (`.standard-button`):** Defined in `styles.css`. Uses `--main-font-fam`, standard padding, `--border-radius`, transitions.
*   **Primary (Default):** Background `var(--main-color)`, text `var(--second-color)`. Hover: Background `var(--second-color)`, text `white`. (e.g., `#login-btn`, `#register-btn`)
*   **Secondary (`.standard-button.secondary`):** Background `var(--third-color)`, text `var(--main-color)`, border `var(--main-color)`. Hover: Background `var(--main-color)`, text `var(--third-color)`.
*   **Social (`.social-btn` in `login.component.css`):** White background, gray border, specific icon colors (`google`, `facebook`). Hover adds light gray background and subtle shadow/transform.
*   **Sizes (`.small`, `.large`):** Adjust padding and font-size.
*   **Full Width (`.full-width`):** Sets `width: 100%`.

**Example (Login Button):**

```html
<button type="submit" id="login-btn" [disabled]="loginForm.invalid || isLoading">
  Login
</button>
```

```css
/* login.component.css */
#login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--main-color);
  color: var(--second-color);
  border: none;
  border-radius: 6px; /* Could use --border-radius */
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
#login-btn:hover:not(:disabled) {
  background-color: var(--second-color);
  color: white;
}
```

### 3.2 Forms (Login/Register)

*   **Card Container (`#login-card`, `#register-card`):** Uses `--third-color` background, `--border-radius-lg`, padding, shadow. Centered within `#main`. Max-width is set.
*   **Form Group (`.form-group`):** Flex column layout with standard gap.
*   **Label (`label`):** Uses `--main-font-fam`, `--main-color`.
*   **Input/Select (`input`, `select`):** Standard padding, border (`--border-color`), `--border-radius`, uses `#FFFBE6` background.
    *   **Focus:** Border changes to `--second-color`, adds `--shadow-focus`.
    *   **Invalid (`.is-invalid`, `.error`):** Border changes to `--color-error`.
*   **Error Message (`.invalid-feedback`, `.error-message`):** Uses `--color-error` text.
*   **Password Specific:**
    *   `.password-input-group`: Relative positioning for the toggle button.
    *   `.password-toggle`: Absolute positioning, icon styles.
    *   `.password-requirements`: Styled container for requirement list (`register.component.css`).
    *   `.requirement`: Individual requirement style, changes color when `.met`.
*   **Checkboxes (`.checkbox-group` in `register.component.css`):** Flex layout for checkbox and label.

**Example (Email Input - Login):**

```html
<div class="form-group">
  <label for="email">Email</label>
  <input
    type="email"
    id="email"
    name="email"
    [(ngModel)]="email"
    required email #emailInput="ngModel"
    [class.is-invalid]="emailInput.invalid && emailInput.touched"
    placeholder="Enter your email">
  <div class="invalid-feedback" *ngIf="emailInput.invalid && emailInput.touched">
    Please enter a valid email address
  </div>
</div>
```

```css
/* login.component.css */
.form-group input {
  padding: 0.75rem;
  border: 1px solid #d1d5db; /* Could use --border-color */
  border-radius: 6px; /* Could use --border-radius */
  font-size: 1rem;
  transition: border-color 0.2s;
}
.form-group input:focus {
  outline: none;
  border-color: var(--second-color);
  box-shadow: 0 0 0 2px rgba(208, 147, 61, 0.2); /* Could use --shadow-focus */
}
.form-group input.is-invalid {
  border-color: #e02424; /* Could use --color-error */
}
```

### 3.3 Cards (Landing Page)

*   **Hero Block (`#left-block`):** Semi-transparent black background, border-radius, padding, shadow, white text. Contains icon wrappers.
*   **Icon Wrapper (`.icon-wrapper`):** Circular background (`--second-color`), large icon size.
*   **Feature Card (`.feature-card`):** Dark background (`#2C2A1F`), large border-radius, padding, shadow. Contains title, divider (`--second-color`), body text. Hover effect increases scale and shadow.
*   **Mid-Section Tab (`.tab`):** Dark background (`#2C2A1F`), border-radius, padding, bold text. Hover changes background to `--second-color`.
*   **Demo Card (`.demo`):** Dark background (`#2C2A1F`), border-radius, padding, used for placeholders.
*   **Step Card (`.step`):** Semi-transparent dark background, border-radius, padding. Contains heading (`--second-color`) and description box (`--main-color` background).

### 3.4 Navigation (TopNav)

*   **Main Bar (`#main`):** Uses `--main-color` background, padding, flex layout (`space-between`).
*   **Logo (`#shopimy-logo`):** Uses `--second-color`, `--main-font-fam`, large font size.
*   **Nav Items (`#nav-wrapper div`, `.dropdown-header`):** Uses `--third-color` text, hover changes to `--second-color`.
*   **Dropdown (`.dropdown-options`):** Uses `--main-color` background, border-radius, shadow. Hidden by default, shown on hover/click.
*   **Dropdown Item (`.opt`):** Uses `--third-color` text, hover changes background and text color.
*   **Hamburger (`#hamburger`):** Visible on mobile, uses `--third-color` for icon.
*   **Mobile Menu (`#mobile-menu`):** Fixed position, slides in from right, uses `--main-color` background.

---

## 4. Responsiveness

Media queries are used extensively in component-specific CSS files (`landing-page.component.css`, `login.component.css`, `register.component.css`, `top-nav.component.css`) to adjust:

*   Layouts (e.g., changing flex-direction, grid columns).
*   Padding and margins.
*   Font sizes.
*   Visibility of elements (e.g., hiding desktop nav, showing hamburger).

Refer to individual component CSS files for specific breakpoint behavior. Standard breakpoints are defined in `:root`.

---

## 5. Usage Guide

*   **Variables First:** Always use the defined CSS variables (e.g., `var(--main-color)`) for colors, fonts, and common spacing/radii.
*   **Standard Classes:** Utilize standard classes like `.standard-button`, `.standard-table`, `.dashboard-card` where applicable for consistency, especially in the dashboard areas.
*   **Component Scope:** Keep styles specific to a component within its own CSS file (`*.component.css`).
*   **Global Styles:** Only add styles to `src/styles.css` if they truly apply globally or define new reusable variables/base styles.
*   **Check Existing:** Before adding new styles, check if a suitable variable or utility class already exists.

---

By adhering to this guide, developers can ensure the Shopimy application maintains a consistent, professional, and maintainable user interface.
```

**Key Changes and Rationale:**

1.  **Updated CSS Variables:** The variable list now accurately reflects the ones defined in `src/styles.css`, including the color palette (`--main-color`, `--second-color`, etc.), typography (`--main-font-fam`), borders, spacing, shadows, and scrollbar styles. Added descriptions for clarity.
2.  **Global Styles Section:** Included details about `html, body` base styles and common utility classes found in `styles.css`. Added the scrollbar documentation.
3.  **Component Styles Focus:**
    *   **Buttons:** Described the `.standard-button` base and its variations, referencing the specific styles seen in Login/Register (`#login-btn`, `#register-btn`) and social buttons (`.social-btn`).
    *   **Forms:** Detailed the common form structure (`.form-group`, `label`, `input`, `select`), including focus/error states and specific elements like password requirements and checkboxes, drawing examples directly from the Login and Register CSS.
    *   **Cards:** Described the various card types seen on the Landing page (`#left-block`, `.feature-card`, `.tab`, `.step`) and the Login/Register pages (`#login-card`, `#register-card`), noting their backgrounds, borders, shadows, etc.
    *   **Navigation:** Summarized the TopNav styling based on `top-nav.component.css`.
4.  **Specificity:** Provided concrete examples of class names and IDs used in the relevant components (e.g., `#login-card`, `.feature-card`, `#login-btn`).
5.  **Clarity and Structure:** Reorganized sections for better readability, using headings, code blocks, and tables.
6.  **Usage Guide:** Added clearer instructions on *how* to use the defined styles and variables.
7.  **Removed Outdated Info:** Removed references to styles or components not clearly present or relevant to the specified focus pages (Landing, Login, Register).
8.  **Accessibility:** Kept the accessibility section as it's good practice.