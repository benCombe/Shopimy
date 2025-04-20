---

## 🔥 Review: End-to-End Store Creation Process

**Goal:** Conduct a comprehensive review of the entire store creation and initial setup workflow, from user initiation to a viewable store, ensuring functionality, data integrity, and adherence to requirements and best practices.

**Context:**
*   The store creation/editing process is primarily handled by the `StoreEditorComponent` on the frontend and the `StoreController` on the backend.
*   Data is persisted in the `Stores`, `StoreThemes`, `StoreBanners`, and `StoreLogos` tables.
*   Relevant documentation: `ARCHITECTURE.md`, `REQUIREMENTS.md`, `DEVELOPMENT_GUIDELINES.md`, `.cursorrules`.
*   A specific bug related to store name derivation during creation needs verification (`TASKS.md`).
*   The initial store setup workflow implementation (`TASKS.md`) is central to this review.

**Scope & Steps:**

1.  **Initiation:**
    *   Verify how a logged-in user initiates store creation (e.g., automatically on first dashboard visit if no store exists, via a button). Check `StoreOwnerDashboardComponent` logic.
    *   Confirm navigation to the `StoreEditorComponent`.
2.  **Store Editor UI & Data Flow (Frontend):**
    *   Review `StoreEditorComponent.ts` and `.html`.
    *   Verify UI elements for setting Store Name, URL, Banner Text, Logo Text are present and functional.
    *   Verify integration with `ThemesComponent` for theme selection.
    *   Verify integration/placeholder for `ProductManagementComponent` (initial product add).
    *   Verify component selection logic (if implemented, based on `availableComponents`).
    *   Check data binding (`[(ngModel)]` or `formControlName`) for all fields.
    *   Review how changes in editor controls update the `store` object within the component.
3.  **Store Preview (Frontend):**
    *   Review `StorePreviewComponent.ts` and `.html`.
    *   Verify that changes made in the `StoreEditorComponent` (theme, text, selected components) are accurately reflected in the preview *without* relying on the old iframe/postMessage method (confirm refactor task completion).
4.  **Saving Configuration (Frontend -> Backend):**
    *   Review the `saveChanges()` / `createStore()` / `updateStore()` logic in `StoreEditorComponent.ts`.
    *   Verify the payload sent to `StoreService`. Is the `StoreDetails` object correctly structured? Is `componentVisibility` serialized correctly (if applicable)?
    *   Review `StoreService.ts` methods (`createStore`, `updateStore`). Ensure they correctly format data and call the backend API with authentication headers.
5.  **Backend Processing (`StoreController`):**
    *   Review `StoreController.cs` (`CreateStore`, `UpdateStore` actions).
    *   **Authorization:** Confirm `[Authorize]` attribute is present and user ID extraction from claims is correct and secure. Verify users can only create/update their *own* store.
    *   **Validation:** Check for validation of input (e.g., required fields, URL format).
    *   **Uniqueness Checks:** Verify checks for unique store URL and unique store name (handling potential conflicts).
    *   **Store Name Derivation:** **Critically verify** that the store name is correctly derived from the *username* part of the email during creation, not the full email (addressing the bug in `TASKS.md`).
    *   **Data Persistence:** Confirm logic correctly inserts/updates records in `Stores`, `StoreThemes`, `StoreBanners`, `StoreLogos` tables. Check foreign key relationships.
    *   **Default Values:** Verify appropriate default values are set (e.g., default theme, logo text).
    *   **Error Handling:** Check for proper error handling (e.g., database errors, validation failures) and meaningful responses to the frontend.
6.  **Database Verification:**
    *   Conceptually review `TableCreation.sql` for the `Stores`, `StoreThemes`, `StoreBanners`, `StoreLogos` tables. Do the schemas support all required data? Are constraints appropriate?
    *   *(Manual Step Recommended)*: Manually inspect the database after a test creation/update to confirm data is saved correctly in all relevant tables.
7.  **Public Store View:**
    *   Verify that after saving, the store is accessible via its public URL (`/:storeUrl`).
    *   Check that `StorePageComponent` correctly fetches and displays the saved data (theme, text, components based on visibility settings).

**Acceptance Criteria:**
*   User can successfully create a new store via the dashboard/editor flow.
*   User can successfully update an existing store's configuration.
*   All entered data (name, URL, theme, text, component visibility) is correctly persisted in the database.
*   The store name derivation bug is confirmed fixed (uses username, not full email).
*   The store preview accurately reflects editor changes.
*   The public store page (`/:storeUrl`) displays the saved configuration correctly.
*   The process is secure (authorization checks).
*   Basic validation and error handling are functional.
*   The workflow adheres to requirements in `REQUIREMENTS.md` (FR4.2.1, FR4.2.3).

**Files:**
*   `WebClient/src/app/components/store-owner-layout/store-owner-dashboard/store-owner-dashboard.component.ts`
*   `WebClient/src/app/components/store-editor/store-editor.component.ts`
*   `WebClient/src/app/components/store-owner-layout/themes/themes.component.ts`
*   `WebClient/src/app/components/shared/store-preview/store-preview.component.ts`
*   `WebClient/src/app/services/store.service.ts`
*   `WebClient/src/app/models/store-details.ts`
*   `WebClient/src/app/models/store-theme.model.ts`
*   `WebClient/src/app/models/component-visibility.model.ts`
*   `Server/Controllers/StoreController.cs`
*   `Server/Models/Store.cs`
*   `Server/Models/StoreTheme.cs`
*   `Server/Models/StoreBanner.cs`
*   `Server/Models/StoreLogo.cs`
*   `Server/Models/StoreDetails.cs` (Backend version if different)
*   `Server/Data/AppDbContext.cs`
*   `Database/TableCreation.sql`
*   `Documents/ARCHITECTURE.md`
*   `Documents/REQUIREMENTS.md`
*   `Documents/TASKS.md`
*   `.cursorrules`

**Priority:** 🔥 High

---

## 📝 Review Findings & Action Items (Generated from Code Audit)

**Overall:** The workflow is largely functional, meets core requirements (including store name derivation fix), and has good structure. However, several critical and minor issues need addressing.

**Action Items:**

1.  **Database Schema (`Database/TableCreation.sql`):**
    *   **Critical:** Add `component_visibility NVARCHAR(MAX)` column to `StoreThemes` table.
    *   Define primary keys for `StoreBanners` and `StoreLogos` tables (likely `store_id`).
    *   Remove duplicate `OrderItems` table definition.
2.  **Backend (`Server/Controllers/StoreController.cs`):**
    *   Wrap `CreateStore` and `UpdateStore` multi-table DB operations in explicit transactions (`BeginTransaction`).
    *   Enhance input validation using data annotations on the `StoreDetails` model (`Server/Models/StoreDetails.cs`).
3.  **Frontend (`WebClient/src/app/...`):**
    *   **`ThemesComponent`:** Remove redundant `saveTheme()` method; rely on parent editor for saving.
    *   **`StoreEditorComponent`:** Improve user feedback for save errors (show UI message, not just console log).
4.  **Verification Tasks (Requires inspecting HTML templates):**
    *   **`store-editor.component.html`:** Confirm correct data binding (e.g., `[(ngModel)]`) for all relevant fields.
    *   **`store-owner-dashboard.component.html`:** Check usage/necessity of `showCreateStorePrompt` flag.
    *   **`store-page.component.html` (Public):**
        *   Verify how theme data (`storeData.theme_1`, etc.) is applied (recommend CSS variables).
        *   Confirm `componentVisibility` data is used to conditionally render page sections.
5.  **Component Selection Feature:** Clarify status/implementation location of the "component selection logic" mentioned in the original review scope (Step 2). Update this document or `TASKS.md` accordingly.
    *   **Clarification:** The component selection UI (checkboxes) and the logic to update the list of selected components (`availableComponents`) reside within `WebClient/src/app/components/store-owner-layout/store-editor/store-editor.component.ts`. The resulting visibility state (which components are selected/visible) is intended to be stored as a serialized string (likely JSON) in the `component_visibility` column of the `StoreThemes` table in the database, passed via the `StoreDetails` model during save operations in `Server/Controllers/StoreController.cs`. The public store page (`store-page.component.html`) needs to fetch this data and use it to conditionally render its sections (Verification Task 4.c found this might not be fully implemented yet).