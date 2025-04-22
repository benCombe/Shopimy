# TASK: Align Live Store Components with Store Preview Components

**Goal:** Refactor the `StorePageComponent` and its child components (`WebClient/src/app/components/customer-layout/store-page/`) to match the visual structure, styling, and component usage intended for the `StorePreviewComponent` (`WebClient/src/app/components/shared/store-preview/`). The preview currently represents a more attractive and desired layout than the live store page found at `/[storeUrl]`.

**Context:**
*   **User Request:** Users want their live store page (`/[storeUrl]`) to look as good as the "Live Store Preview" they see in the editor.
*   **Current State:** `StorePageComponent` likely uses older or differently styled components/HTML compared to the structure implied or rendered by `StorePreviewComponent`.
*   **Target State:** `StorePageComponent` should render its sections (Header, Hero, Featured Products, Categories, Testimonials, Newsletter, Footer) using the same modern, reusable Angular components that are intended for the `StorePreviewComponent`. These components should be styled according to `styles.css` and `README-STYLES.md`.
*   **Dependency:** This task is related to the `StorePreviewComponent` refactor task (mentioned in `TASKS.md`), which aims to make the preview use actual Angular components. This task ensures the *live* store page uses those same components.
*   **Data:** `StorePageComponent` receives `storeData` (including `theme` and `componentVisibility`) from `StoreService`.

**Requirements:**

1.  **Analyze Preview Structure:** Examine `StorePreviewComponent.html` (and potentially related design documents/Figma links in `README.md`) to understand the target layout, structure, and intended components for each store section (Header, Hero, Featured Products, etc.).
2.  **Identify/Create Reusable Components:**
    *   Identify existing reusable components (e.g., `app-item-card`) suitable for the live store page sections.
    *   If necessary, *create* new, well-styled, reusable Angular components for sections currently represented by basic HTML in `StorePreviewComponent` or `StorePageComponent` (e.g., `StoreHeaderComponent`, `HeroBannerComponent`, `FeaturedProductsComponent`, `StoreFooterComponent`). These components should accept necessary data (`theme`, `storeData`) as inputs.
    *   Ensure these components adhere to the styling defined in `styles.css` and `README-STYLES.md`.
3.  **Refactor `StorePageComponent`:**
    *   Modify `StorePageComponent.html` to replace its current content structure with the identified/newly created reusable components.
    *   Ensure data (`storeData`, theme properties) is correctly passed from `StorePageComponent.ts` to these child components via `@Input()` bindings.
    *   Implement conditional rendering (`*ngIf`) for each component based on the `storeData.componentVisibility` settings fetched from the backend (similar to how `StorePreviewComponent` handles it).
4.  **Styling:** Ensure all styling uses CSS variables from `styles.css` and follows the guidelines in `README-STYLES.md`. Avoid component-specific styles where global styles or utility classes suffice.
5.  **Adherence:** Strictly follow all guidelines in `.cursorrules`.

**Acceptance Criteria:**
*   The live store page (`/[storeUrl]`) visually matches the layout and styling presented in the `StorePreviewComponent`.
*   `StorePageComponent` renders its content using reusable Angular components for each section.
*   Component visibility settings configured in the editor correctly show/hide sections on the live store page.
*   Styling is consistent with the project's design system (`styles.css`, `README-STYLES.md`).
*   Code follows all `.cursorrules` (file size, DRY, etc.).

**Files:**
*   **Primary:**
    *   `WebClient/src/app/components/customer-layout/store-page/store-page.component.ts`
    *   `WebClient/src/app/components/customer-layout/store-page/store-page.component.html`
    *   `WebClient/src/app/components/customer-layout/store-page/store-page.component.css`
*   **Reference:**
    *   `WebClient/src/app/components/shared/store-preview/store-preview.component.html` (Target structure reference)
    *   `WebClient/src/app/components/shared/store-preview/store-preview.component.ts` (Component visibility logic reference)
    *   `WebClient/src/app/models/store-details.ts`
    *   `WebClient/src/app/models/component-visibility.model.ts`
    *   `WebClient/src/styles.css`
    *   `WebClient/src/README-STYLES.md`
    *   `Documents/ARCHITECTURE.md`
    *   `Documents/TASKS.md`
    *   `.cursorrules`
*   **Potentially New:** New component files (`.ts`, `.html`, `.css`) for reusable store sections if they don't exist.

**Priority:** 🔥 High