// Documents/TASKS.md
- [x] ⚠️ **FEAT: Implement Dashboard Promotions Tab** (Completed 2023-05-04)
    - **Goal:** Add a new "Promotions" tab to the Store Owner Dashboard (`/dashboard`). This tab will allow store owners to create, view, update, and delete promotional codes or discounts for their store.
    - **Requirements:**
        1.  **Database:** ✅
            *   Create a new `Promotions` table in the database (`Database/TableCreation.sql`).
            *   Define columns: `PromotionId` (PK, INT, IDENTITY), `StoreId` (FK to Stores), `Code` (NVARCHAR, unique per store), `Description` (NVARCHAR, nullable), `DiscountType` (NVARCHAR - e.g., 'Percentage', 'FixedAmount'), `DiscountValue` (DECIMAL), `StartDate` (DATETIME2), `EndDate` (DATETIME2, nullable), `IsActive` (BIT), `UsageLimit` (INT, nullable).
            *   Update `AppDbContext.cs` to include a `DbSet<Promotion> Promotions { get; set; }`.
            *   Update `OnModelCreating` in `AppDbContext.cs` to map the `Promotion` entity.
            *   *(Optional: Create EF Core Migration if project uses migrations)*
        2.  **Backend (`Server/`):** ✅
            *   Create a `Promotion.cs` model in `Server/Models/`.
            *   Create `IPromotionsService.cs` and `PromotionsService.cs` in `Server/Services/` with methods for CRUD operations (e.g., `GetPromotionsByStoreAsync`, `GetPromotionByIdAsync`, `CreatePromotionAsync`, `UpdatePromotionAsync`, `DeletePromotionAsync`). Implement basic logic.
            *   Create `PromotionsController.cs` in `Server/Controllers/` with API endpoints (`GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}`). Ensure endpoints are protected (`[Authorize]`) and validate that users can only manage promotions for their *own* store (using `storeId` from claims or fetched based on `userId`).
            *   Register `IPromotionsService` and `PromotionsService` in `Program.cs`.
        3.  **Frontend (`WebClient/`):** ✅
            *   Create `PromotionsComponent` (`promotions.component.ts`, `.html`, `.css`) in `WebClient/src/app/components/store-owner-layout/promotions/`.
            *   Implement basic UI for listing promotions (e.g., in a table) and a form (modal or inline) for creating/editing promotions. Use existing styling patterns (`README-STYLES.md`).
            *   Create `PromotionsService` (`promotions.service.ts`) in `WebClient/src/app/services/` with methods to call the backend `PromotionsController` endpoints.
            *   Update `app.routes.ts` to include a route for the promotions component within the dashboard layout (e.g., `/dashboard` -> `StoreOwnerDashboardComponent` which handles sub-routes).
            *   Update `SideNavComponent` (`side-nav.component.ts`, `.html`) to add a "Promotions" link/item.
            *   Update `StoreOwnerDashboardComponent` (`store-owner-dashboard.component.ts`, `.html`) to conditionally display the `PromotionsComponent` when the corresponding nav item is selected.
    - **Acceptance Criteria:** ✅
        *   A "Promotions" link appears in the dashboard side navigation.
        *   Clicking the link displays the `PromotionsComponent`.
        *   The component fetches and displays a list of existing promotions for the logged-in store owner.
        *   The component provides a way to initiate creating a new promotion (e.g., an "Add Promotion" button).
        *   A form allows users to enter details for a new promotion (Code, Type, Value, Dates).
        *   Submitting the form successfully creates a new promotion via the backend API and updates the displayed list.
        *   Users can initiate editing an existing promotion from the list.
        *   The form pre-fills with the selected promotion's data for editing.
        *   Saving changes updates the promotion via the backend API and updates the list.
        *   Users can delete an existing promotion (with confirmation).
        *   Backend endpoints correctly authorize requests based on the logged-in user's store.
    - **Files:** ✅
        *   `Database/TableCreation.sql`, `Server/Data/AppDbContext.cs`, `Server/Models/Promotion.cs`, `Server/Services/IPromotionsService.cs`, `Server/Services/PromotionsService.cs`, `Server/Controllers/PromotionsController.cs`, `Server/Program.cs`, `WebClient/src/app/components/store-owner-layout/promotions/promotions.component.*`, `WebClient/src/app/services/promotions.service.ts`, `WebClient/src/app/app.routes.ts`, `WebClient/src/app/components/store-owner-layout/side-nav/side-nav.component.*`, `WebClient/src/app/components/store-owner-layout/store-owner-dashboard/store-owner-dashboard.component.*`
    - **Priority:** ⚠️ Medium
    - **Completion Date:** 2023-05-04
    - **Additional Notes:** 
        * Initially implemented with a table layout for promotions display
        * Enhanced to a responsive card-based layout for better mobile experience
        * Added detailed form validation and confirmation dialogs
        * Implemented proper authorization to ensure store owners can only manage their own promotions