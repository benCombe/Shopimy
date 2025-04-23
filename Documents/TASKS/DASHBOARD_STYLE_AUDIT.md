// Documents/TASKS.md
- [ ] ⚠️ **Style Audit & Standardization: Dashboard Components**
    - **Goal:** Perform a comprehensive style audit of the `StoreOwnerDashboardComponent` and all its child components (`Overview`, `Profile`, `Settings`, `ProductManagement`, `CategoryList`, `Orders`, `Themes`, `StoreEditor`, `Promotions`, `Analytics`, `SideNav`). Standardize their appearance to match the established visual style of the Landing Page, Login, Register, and Store Editor components.
    - **Context:** The dashboard components currently have inconsistent styling (custom classes, hardcoded values) that deviates from the global theme defined in `WebClient/src/styles.css` and documented in `WebClient/src/README-STYLES.md`. The target style is exemplified by `LoginComponent`, `RegisterComponent`, and `LandingPageComponent`.
    - **Acceptance Criteria:**
        *   All dashboard components visually align with the target style (colors, fonts, spacing, shadows, border-radius).
        *   Custom/redundant styles within component CSS files (`*.component.css`) are replaced with global CSS variables and standard utility classes (e.g., `.standard-button`, `.standard-table`, `.dashboard-card`) where applicable.
        *   Hardcoded color, font, spacing, shadow, and border-radius values are replaced with corresponding CSS variables from `styles.css`.
        *   Responsiveness is maintained or improved according to global patterns.
        *   Code adheres to `.cursorrules` (modify existing files, use variables, maintain readability).
    - **Files:**
        - `WebClient/src/styles.css` (Reference - Source of Truth)
        - `WebClient/src/README-STYLES.md` (Reference - Documentation)
        - `WebClient/src/app/components/store-owner-layout/store-owner-dashboard/store-owner-dashboard.component.ts` & `.html` & `.css`
        - `WebClient/src/app/components/store-owner-layout/overview/overview.component.ts` & `.html` & `.css`
        - `WebClient/src/app/components/store-owner-layout/profile/profile.component.ts` & `.html` & `.css`
        - `WebClient/src/app/components/store-owner-layout/settings/settings.component.ts` & `.html` & `.css`
        - `WebClient/src/app/components/store-owner-layout/product-management/product-management.component.ts` & `.html` & `.css`
        - `WebClient/src/app/components/category-list/category-list.component.ts` & `.html` & `.css` (Assuming used in dashboard)
        - `WebClient/src/app/components/store-owner-layout/orders/orders.component.ts` & `.html` & `.css`
        - `WebClient/src/app/components/store-owner-layout/themes/themes.component.ts` & `.html` & `.css`
        - `WebClient/src/app/components/store-editor/store-editor.component.ts` & `.html` & `.css` (Reference - Target Style)
        - `WebClient/src/app/components/store-owner-layout/promotions/promotions.component.ts` & `.html` & `.css`
        - `WebClient/src/app/components/store-owner-layout/analytics/analytics.component.ts` & `.html` & `.css`
        - `WebClient/src/app/components/store-owner-layout/side-nav/side-nav.component.ts` & `.html` & `.css`
        - `WebClient/src/app/components/account/login/login.component.css` (Reference - Target Style)
        - `WebClient/src/app/components/account/register/register.component.css` (Reference - Target Style)
        - `WebClient/src/app/components/landing-page/landing-page.component.css` (Reference - Target Style)
    - **Priority:** ⚠️ Medium