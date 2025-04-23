// Documents/TASKS/COMPONENT_STYLE_AUDIT_TASK.md
# TASK: Comprehensive Frontend Component Style Audit & Standardization

**Goal:** Perform a thorough style audit of all Angular components within the `WebClient/src/app/components/` directory. Identify and refactor any HTML or CSS that deviates from the established project style guidelines. Implement suggestions for style improvements.

**Context:**
*   The application aims for a consistent visual identity across all user-facing components.
*   Style guidelines are documented in `WebClient/src/README-STYLES.md`.
*   Global styles, CSS variables, and standard utility classes are defined in `WebClient/src/styles.css`.
*   Reference components demonstrating the target style include `LandingPageComponent`, `LoginComponent`, `RegisterComponent`, and potentially `StoreEditorComponent`.
*   Development must adhere to `.cursorrules`.

**Requirements:**

1.  **Audit Scope:** Analyze all `.html` and `.css` files within `WebClient/src/app/components/` and its subdirectories.
2.  **Guideline Adherence:** Ensure all audited components align with the principles and specifics outlined in `README-STYLES.md` and `styles.css`.
3.  **Identify Deviations:** Specifically look for:
    *   Hardcoded values (colors, spacing, fonts, shadows, border-radius) instead of CSS variables (e.g., `color: #393727;` should be `color: var(--main-color);`).
    *   Custom CSS classes that duplicate functionality of global utility classes (e.g., custom button styles instead of `.standard-button`).
    *   Inconsistent layout patterns, spacing, or HTML structure compared to reference components.
    *   Redundant, unused, or overly specific CSS rules.
    *   Use of inline styles (`style="..."`).
    *   Responsiveness issues or deviations from standard breakpoints/patterns.
4.  **Refactor & Standardize:**
    *   Modify existing component files directly (`.cursorrules` - Edit, Don't Copy).
    *   Replace hardcoded values with appropriate CSS variables.
    *   Replace custom classes with standard utility classes where applicable.
    *   Remove redundant/unused CSS and inline styles.
    *   Adjust HTML structure/classes for consistency if necessary.
    *   Ensure responsiveness aligns with global patterns.
5.  **Suggestions & Improvements:**
    *   Identify opportunities for creating *new* global utility classes if patterns repeat across multiple components.
    *   Suggest improvements to CSS organization or potential refactoring for better maintainability.
    *   Identify any accessibility improvements related to styling (e.g., focus states, contrast).
    *   Check if `README-STYLES.md` needs updates based on findings.
6.  **Implementation:** Implement the suggested improvements directly into the codebase.

**Acceptance Criteria:**
*   All components within the specified scope visually align with the documented style guide and reference components.
*   CSS primarily uses variables defined in `styles.css`.
*   Standard utility classes are consistently applied.
*   Code adheres to `.cursorrules`.
*   Suggestions for further style improvements are provided and implemented.
*   `README-STYLES.md` is updated if necessary.

**Files:**
*   **Primary Target:** `WebClient/src/app/components/**/*.html`, `WebClient/src/app/components/**/*.css`
*   **Reference:** `WebClient/src/README-STYLES.md`, `WebClient/src/styles.css`
*   **Reference Components:** `WebClient/src/app/components/landing-page/`, `WebClient/src/app/components/account/login/`, `WebClient/src/app/components/account/register/`, `WebClient/src/app/components/store-owner-layout/store-editor/`
*   **Rules:** `.cursorrules`
*   **Checklist (Optional):** `Documents/TASKS/COMPONENT_STYLE_AUDIT.md` (can be used as a guide for component groups)

**Priority:** ⚠️ Medium