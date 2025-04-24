// Documents/TASKS.md
- [ ] ⚠️ **Standardize Component Tables**
    - **Goal:** Research all HTML tables within `WebClient/src/app/components/`, develop standardized guidelines based on `README-STYLES.md` and best practices, and refactor existing tables to conform to the new standard.
    - **Context:** Current tables may have inconsistent styling and structure. Standardization will improve maintainability and visual consistency. `README-STYLES.md` and `styles.css` define the core design system.
    - **Requirements:**
        1.  **Research:** Identify all components using `<table>` elements. Analyze their current structure and styling.
        2.  **Guidelines:** Develop clear guidelines for table structure (HTML semantics) and styling (CSS classes, variable usage, responsiveness, accessibility). Propose these as an update to `README-STYLES.md`.
        3.  **Refactor:** Modify existing component HTML and CSS to align with the new guidelines. Ensure tables are responsive and use CSS variables from `styles.css`. Remove old, inconsistent table-specific styles.
        4.  **Verification:** Ensure refactored tables render correctly and consistently across different contexts.
    - **Acceptance Criteria:**
        *   All identified tables use a consistent HTML structure and CSS classes.
        *   Table styles utilize variables defined in `styles.css`.
        *   `README-STYLES.md` includes a new section detailing table guidelines.
        *   Refactored tables are responsive.
        *   Code adheres to `.cursorrules`.
    - **Files:**
        - `WebClient/src/app/components/**/*.html` (Audit target)
        - `WebClient/src/app/components/**/*.css` (Audit target)
        - `WebClient/src/README-STYLES.md` (Reference & Update target)
        - `WebClient/src/styles.css` (Reference)
        - `.cursorrules` (Reference)
    - **Priority:** ⚠️ Medium