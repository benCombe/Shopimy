# Task: Implement Store Component Visibility Feature

**Feature:** Enable users to select which components (e.g., header, hero banner, featured products) are visible on their public store page via the "Components" tab in the Store Editor.

**Goal:** Hook up the "Components" tab UI in the `StoreEditorComponent` to capture user selections, pass this information via the `StoreService` to the `StoreController` backend, persist the visibility settings in the `StoreThemes` table, and use these settings to conditionally render sections on the public `StorePageComponent` and the `StorePreviewComponent`.

**Context:**
*   The "Themes" tab currently saves theme data (colors, fonts) successfully through a similar flow (`ThemesComponent` -> `StoreEditorComponent` -> `StoreService` -> `StoreController`).
*   The `StoreEditorComponent` manages a list of `availableComponents` with an `isSelected` property.
*   The `StoreThemes` table needs a column (e.g., `component_visibility` of type `NVARCHAR(MAX)`) to store these settings, likely as a JSON string.
*   The frontend uses a `ComponentVisibility` model (`WebClient/src/app/models/component-visibility.model.ts`).
*   The public store page (`StorePageComponent`) and the live preview (`StorePreviewComponent`) need to read these settings to show/hide sections.

**Key Files:**
*   `Database/TableCreation.sql`
*   `Server/Models/StoreTheme.cs`
*   `Server/Models/StoreDetails.cs` (Backend DTO)
*   `Server/Controllers/StoreController.cs`
*   `Server/Data/AppDbContext.cs`
*   `WebClient/src/app/models/component-visibility.model.ts`
*   `WebClient/src/app/models/store-details.ts` (Frontend Model)
*   `WebClient/src/app/services/store.service.ts`
*   `WebClient/src/app/components/store-owner-layout/store-editor/store-editor.component.ts` & `.html`
*   `WebClient/src/app/components/shared/store-preview/store-preview.component.ts` & `.html`
*   `WebClient/src/app/components/customer-layout/store-page/store-page.component.ts` & `.html`

**Acceptance Criteria:**
1.  Database schema (`TableCreation.sql`) includes a `component_visibility` column in the `StoreThemes` table.
2.  Backend models (`StoreTheme.cs`, `StoreDetails.cs`) are updated to handle `ComponentVisibility` data.
3.  `StoreController.cs` (`CreateStore`, `UpdateStore`) correctly saves/updates the `component_visibility` field (as a JSON string) in the `StoreThemes` table within a transaction.
4.  Frontend models (`StoreDetails.ts`, `ComponentVisibility.model.ts`) correctly represent this data.
5.  `StoreEditorComponent.ts` correctly gathers component visibility data from its UI state (e.g., `availableComponents`) into a `ComponentVisibility` object.
6.  `StoreService.ts` correctly serializes the `ComponentVisibility` object to a JSON string before sending it in the `createStore` and `updateStore` requests.
7.  `StoreService.ts` correctly deserializes the `componentVisibility` JSON string from the backend into a `ComponentVisibility` object when fetching store details (`getStoreDetails`, `getCurrentUserStore`).
8.  `StoreEditorComponent.ts` correctly initializes the state of its component toggles/checkboxes based on the `componentVisibility` data loaded from the `StoreService`.
9.  `StorePreviewComponent.ts` & `.html` use the `componentVisibility` data (passed as input) to conditionally render preview sections using `*ngIf`.
10. `StorePageComponent.ts` & `.html` fetch the `storeData` (including `componentVisibility`) and use it to conditionally render the actual store sections using `*ngIf`.
11. Saving the store configuration in the editor successfully persists both theme and component visibility settings.