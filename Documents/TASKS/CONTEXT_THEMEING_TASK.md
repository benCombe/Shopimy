# TASK: Implement Context-Specific Theming

**Goal:** Ensure the correct theme (base or user-defined) is applied consistently across the application based on the current page context.

**Context:**
*   The application has two main theme contexts:
    1.  **Base Theme:** Applied to general "Shopimy" platform pages (Landing, About, Contact, Blog, Auth pages, etc.). These are typically routed through `PublicLayoutComponent`.
    2.  **User/Store Theme:** Applied to user-specific or store-specific pages (Dashboard `/dashboard`, Public Store View `/:storeUrl`, Cart, Checkout). These are typically routed through `StoreOwnerDashboardComponent` or `StorePageComponent`.
*   The `ThemeService` (`WebClient/src/app/services/theme.service.ts`) is responsible for applying themes. It may need refactoring to support dynamic theme switching via CSS variables.
*   Store-specific themes are fetched via `StoreService` (`WebClient/src/app/services/store.service.ts`) from the `StoreThemes` table.
*   The base theme likely corresponds to the default styles in `WebClient/src/styles.css`.
*   Header (`TopNavComponent`) and Footer (`FooterComponent`) must dynamically update their appearance based on the active theme context. The Footer is noted to be partially working for the user theme.

**Requirements:**

1.  **Analyze `ThemeService`:** Review `WebClient/src/app/services/theme.service.ts`. Determine its current implementation (e.g., class-based vs. CSS variables).
2.  **Refactor `ThemeService` (if needed):**
    *   Modify the service to apply themes by dynamically updating CSS variables on a high-level element (e.g., `body` or the root `AppComponent`).
    *   Create methods like `applyBaseTheme()` (or `applyTheme(null)`) to apply default styles and `applyStoreTheme(theme: StoreTheme)` to apply a specific store's theme.
3.  **Implement Context Detection & Theme Switching:**
    *   Identify the appropriate components (likely layout components: `PublicLayoutComponent`, `StoreOwnerDashboardComponent`, `StorePageComponent`) to detect the current route context.
    *   In the `ngOnInit` of these layout components, call the relevant `ThemeService` method:
        *   `PublicLayoutComponent`: Call `applyBaseTheme()`.
        *   `StoreOwnerDashboardComponent`, `StorePageComponent`: Fetch the appropriate store theme (via `StoreService`) and call `applyStoreTheme(themeData)`. Handle potential loading delays.
4.  **Update Header (`TopNavComponent`):** Ensure its styles use CSS variables (e.g., `background-color: var(--main-color); color: var(--font-color);`) so it updates automatically when the theme changes.
5.  **Verify Footer (`FooterComponent`):** Confirm the footer uses CSS variables and correctly reflects *both* the base theme (on platform pages) and the user/store theme (on user/store pages).
6.  **Testing:** Manually verify theme application across different page types (Platform vs. User/Store) and ensure Header/Footer update correctly.

**Acceptance Criteria:**
*   Platform pages (Landing, About, Contact, Blog, Auth, etc.) consistently display the base theme, including the header and footer.
*   User/Store pages (Dashboard, `/:storeUrl`, Cart, Checkout) consistently display the theme defined by the respective store owner, including the header and footer.
*   Theme switching occurs correctly when navigating between different page types.
*   `ThemeService` uses a CSS variable approach.
*   Code adheres to `.cursorrules`.

**Files:**
*   `WebClient/src/app/services/theme.service.ts`
*   `WebClient/src/app/services/store.service.ts`
*   `WebClient/src/app/app.routes.ts` (Reference)
*   `WebClient/src/app/app.component.ts` (Potential orchestrator or root element target)
*   `WebClient/src/app/components/layouts/public-layout/public-layout.component.ts`
*   `WebClient/src/app/components/store-owner-layout/store-owner-dashboard/store-owner-dashboard.component.ts`
*   `WebClient/src/app/components/customer-layout/store-page/store-page.component.ts`
*   `WebClient/src/app/components/top-nav/top-nav.component.ts` & `.css`
*   `WebClient/src/app/components/footer/footer.component.ts` & `.css`
*   `WebClient/src/styles.css` (Reference for base theme variables)
*   `Server/Models/StoreTheme.cs` (Reference)
*   `Database/TableCreation.sql` (Reference - `StoreThemes` table)
*   `.cursorrules`

**Priority:** 🔥 High