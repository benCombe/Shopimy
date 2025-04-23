// Documents/TASKS/FORM_STYLE_STANDARDIZATION_TASK.md
# TASK: Standardize Form Styles using Login/Register as Reference

**Goal:** Establish the `LoginComponent` and `RegisterComponent` as the official style reference for all forms within the `WebClient`. Audit existing components for forms and refactor their HTML and CSS to align with this standard, ensuring consistency in appearance, structure, and validation display. Update `README-STYLES.md` to reflect this standard.

**Context:**
*   Currently, `WebClient/src/README-STYLES.md` lacks a defined reference for form styling, leading to potential inconsistencies.
*   The `LoginComponent` (`WebClient/src/app/components/account/login/`) and `RegisterComponent` (`WebClient/src/app/components/account/register/`) represent the desired look and feel for forms.
*   Global styles, CSS variables (`--main-color`, `--border-radius`, `--spacing-md`, etc.), and utility classes (`.standard-button`, `.form-group`, `.error-message`, etc.) are defined in `WebClient/src/styles.css`.
*   Development must adhere to `.cursorrules`, including modifying existing files directly and prioritizing the use of global styles/variables.

**Requirements:**

1.  **Update Documentation (`README-STYLES.md`):**
    *   Add a dedicated section for "Forms".
    *   Explicitly state that `LoginComponent` and `RegisterComponent` serve as the primary reference for form structure and styling.
    *   Document the standard patterns observed in the reference components, including:
        *   HTML structure (e.g., use of `.form-group`, `<label>`, `<input>`, error message containers).
        *   Standard CSS classes to use (e.g., `.form-control`, `.is-invalid`, `.invalid-feedback`, `.standard-button` for submission).
        *   Consistent use of CSS variables for colors, spacing, borders, etc.
        *   Standard approach for displaying validation errors.
2.  **Component Audit:**
    *   Identify all Angular components within `WebClient/src/app/components/` that contain HTML forms (`<form>`) or utilize Angular's `FormGroup`/`FormControl`.
3.  **Refactor Forms:**
    *   For each identified component containing a form:
        *   Analyze its current HTML structure and CSS styling.
        *   Refactor the HTML to match the structure used in `LoginComponent` / `RegisterComponent` (e.g., consistent use of `.form-group`).
        *   Refactor the CSS to remove component-specific styles that duplicate global styles or deviate from the reference components.
        *   Ensure all styling uses CSS variables and utility classes defined in `styles.css`.
        *   Standardize the display of validation errors to match the reference components.
        *   Verify responsiveness aligns with the reference components and global patterns.
4.  **Adherence:** Ensure all changes comply with `.cursorrules`.

**Acceptance Criteria:**
*   `WebClient/src/README-STYLES.md` is updated with a clear "Forms" section referencing `LoginComponent` and `RegisterComponent`.
*   All identified forms within `WebClient/src/app/components/` visually and structurally align with the `LoginComponent` and `RegisterComponent`.
*   Refactored form CSS primarily utilizes global variables and utility classes from `styles.css`.
*   Validation states and error messages are displayed consistently across all forms.
*   Refactored forms remain functional and responsive.
*   Code modifications adhere to `.cursorrules`.

**Files:**
*   **Primary Target:** `WebClient/src/app/components/**/*.html`, `WebClient/src/app/components/**/*.css`
*   **Documentation:** `WebClient/src/README-STYLES.md`
*   **Reference:** `WebClient/src/app/components/account/login/*`, `WebClient/src/app/components/account/register/*`, `WebClient/src/styles.css`
*   **Rules:** `.cursorrules`

**Priority:** ⚠️ Medium