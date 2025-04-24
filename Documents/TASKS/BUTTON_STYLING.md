// Documents/TASKS/BUTTON_STYLING.md
# TASK: Standardize Component Buttons

**Goal:** Standardize the styling and implementation of all button elements within the `WebClient` components to ensure consistency, maintainability, and adherence to the project's design system, referencing `WebClient/src/README-STYLES.md`.

**Context:**
*   The project aims for a consistent UI/UX across all components.
*   Button styling guidelines are defined in `WebClient/src/README-STYLES.md` (using the `.standard-button` class and its modifiers).
*   Global styles, including the `.standard-button` definition, are located in `WebClient/src/styles.css`.
*   Development must adhere to `.cursorrules`.

**Requirements:**

1.  **Review Guidelines:** Thoroughly review the "Buttons" section in `WebClient/src/README-STYLES.md` and the corresponding `.standard-button` styles in `WebClient/src/styles.css`. Understand the usage of `.standard-button` and its modifiers (e.g., `.secondary`, `.small`, `.large`, `.full-width`).
2.  **Audit Components:** Examine all `.html`, `.css`, and relevant `.ts` files within `WebClient/src/app/components/` (and its subdirectories) to identify all instances of `<button>` elements and any custom button styling (e.g., classes like `.button`, `.primary-button`, `.save-btn`, `.action-button`, component-specific button styles, inline styles, or dynamically applied classes).
3.  **Refactor HTML:**
    *   Modify existing button implementations to consistently use the `.standard-button` class.
    *   Apply appropriate modifiers (`.secondary`, `.small`, `.large`, `.full-width`) based on the button's intended appearance and context, replacing previous custom classes where applicable.
    *   Ensure semantic correctness (e.g., use `type="button"` where appropriate if not submitting a form).
4.  **Refactor CSS:**
    *   Remove redundant or custom button CSS rules from component-specific stylesheets (`*.component.css`) that duplicate the functionality provided by the global `.standard-button` styles.
    *   Ensure any remaining component-specific styles complementing `.standard-button` still use CSS variables where appropriate (e.g., for colors, spacing).
5.  **Refactor TypeScript (if necessary):**
    *   Check component TypeScript files (`*.component.ts`) for any logic that dynamically adds custom button classes or styles. Refactor this logic to use the standard classes/modifiers if possible.
6.  **Verify Consistency:** Ensure button usage and appearance are consistent across the application after refactoring.

**Acceptance Criteria:**
*   All `<button>` elements within `WebClient/src/app/components/` primarily use the `.standard-button` class and its documented modifiers.
*   Custom button styles in component CSS files are minimized or eliminated where global styles suffice.
*   Button styling is visually consistent across the application, adhering to `README-STYLES.md`.
*   All changes adhere to `.cursorrules` (modifying existing files, using CSS variables, maintaining readability, etc.).

**Files:**
*   **Primary Target:** `WebClient/src/app/components/**/*.html`, `WebClient/src/app/components/**/*.css`, `WebClient/src/app/components/**/*.ts`
*   **Reference:** `WebClient/src/README-STYLES.md`, `WebClient/src/styles.css`
*   **Reference:** `.cursorrules`, `Documents/ARCHITECTURE.md`

**Priority:** ⚠️ Medium