**TASK:** Refactor Dashboard Themes & Logos Section

**Goal:** Enhance the "Themes & Logos" section within the Store Owner Dashboard (`/dashboard/My Store/Themes & Logos/`) to enable saving and loading of theme settings (colors, font) and integrate logo management (upload, display, delete).

**Context:**
*   The current dashboard likely uses `ThemesComponent` for theme selection UI, but lacks persistence.
*   Logo management is currently missing.
*   The functionality should resemble the data persistence patterns used elsewhere (e.g., saving store settings via services and controllers).
*   Refer to `ARCHITECTURE.md` for component interactions and `Database/TableCreation.sql` for relevant tables (`StoreThemes`, `StoreLogos`).

**Detailed Requirements:**

1.  **Theme Persistence:**
    *   **Load:** When the "Themes & Logos" section loads, fetch the *current* theme settings (colors, font family) for the authenticated user's store from the backend (`StoreThemes` table) and apply them to the `ThemesComponent` controls.
    *   **Save:** Implement a mechanism (e.g., a "Save Theme" button) within the `ThemesComponent` or its parent dashboard container. On save, the selected theme data (colors, font) should be sent via `StoreService` to a backend endpoint.
    *   **Backend:** Update or create an endpoint in `StoreController` (e.g., `PUT /api/store/theme` or integrate into `PUT /api/store/update`) to receive the theme data and persist it to the `StoreThemes` table for the authenticated user's store. Ensure this is done within a transaction if updating multiple related tables.
2.  **Logo Management:**
    *   **Frontend UI:**
        *   Create or modify a component (e.g., `LogoSelectorComponent` or integrate into `ThemesComponent`) to:
            *   Display the current store logo (fetched from the backend). Show a placeholder if no logo exists.
            *   Provide a file input (`<input type="file">`) to allow users to select and upload a new logo image (e.g., PNG, JPG, GIF).
            *   Show a preview of the selected logo before uploading.
            *   Include a button to trigger the logo upload.
            *   Include a button to remove the current logo.
    *   **Frontend Service:**
        *   Create a new `LogoService` or add methods to `StoreService` to:
            *   Handle logo upload: Send image data (e.g., base64 or multipart/form-data) to the backend upload endpoint.
            *   Fetch the current logo URL for the store.
            *   Send a request to delete the current logo.
    *   **Backend:**
        *   Create a new `LogoController` and corresponding `LogoService`.
        *   Implement `POST /api/logo/upload` endpoint:
            *   Requires authentication (`[Authorize]`).
            *   Accepts image data.
            *   Validates file type and size.
            *   Saves the image file to a designated server location (e.g., `wwwroot/images/logos/[storeId]/logo.[ext]`). Ensure the directory structure is handled.
            *   Updates the `StoreLogos` table for the user's store with the relative URL of the saved logo. Use `UPSERT` logic (update if exists, insert if not).
            *   Returns the URL of the uploaded logo.
        *   Implement `GET /api/logo` endpoint:
            *   Requires authentication (`[Authorize]`).
            *   Retrieves the logo URL from the `StoreLogos` table for the authenticated user's store.
            *   Returns the URL or null/empty if no logo exists.
        *   Implement `DELETE /api/logo` endpoint:
            *   Requires authentication (`[Authorize]`).
            *   Removes the entry from the `StoreLogos` table for the user's store.
            *   Deletes the corresponding logo file from the server.
            *   Returns a success status.
3.  **Integration:**
    *   Ensure the `StoreOwnerDashboardComponent` correctly displays the "Themes & Logos" section/page.
    *   Integrate the updated `ThemesComponent` and the new logo management UI into this section.
    *   Ensure theme changes and logo updates are reflected in the UI after saving/uploading/deleting.

**Key Files to Consider:**

*   `WebClient/src/app/components/store-owner-layout/themes/themes.component.ts` & `.html`
*   `WebClient/src/app/components/store-owner-layout/logo-selector/logo-selector.component.ts` & `.html` (or similar, might need creation)
*   `WebClient/src/app/services/store.service.ts`
*   `WebClient/src/app/services/logo.service.ts` (Needs creation or merge)
*   `WebClient/src/app/models/store-details.ts`
*   `WebClient/src/app/models/store-theme.model.ts`
*   `WebClient/src/app/components/store-owner-layout/store-owner-dashboard/store-owner-dashboard.component.ts`
*   `Server/Controllers/StoreController.cs`
*   `Server/Controllers/LogoController.cs` (Needs creation)
*   `Server/Services/LogoService.cs` (Needs creation)
*   `Server/Models/StoreTheme.cs`
*   `Server/Models/StoreLogo.cs`
*   `Server/Data/AppDbContext.cs`
*   `Database/TableCreation.sql`

**Important Considerations:**

*   **Authentication:** Ensure all relevant backend endpoints are protected with `[Authorize]` and validate that users can only modify their *own* store's theme and logo.
*   **Error Handling:** Implement robust error handling on both frontend (user feedback) and backend (logging, appropriate HTTP status codes).
*   **File Handling:** Implement secure file handling on the backend, including validation of file types, size limits, and preventing path traversal issues. Store files in a location accessible by the web server (e.g., `wwwroot`).
*   **Database:** Update the `StoreLogos` table schema if necessary (e.g., ensure `store_id` is the primary key and foreign key). Ensure `StoreThemes` has all necessary columns.
*   **UI/UX:** Provide clear feedback to the user during uploads (loading indicators) and after successful/failed operations.
*   **Code Quality:** Adhere to `.cursorrules` guidelines (simplicity, iteration, focus, quality).