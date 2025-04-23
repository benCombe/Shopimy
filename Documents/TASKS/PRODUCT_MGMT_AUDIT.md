// Documents/TASKS.md
- [ ] 🔥 **Audit Product Management Lifecycle (E2E)**
    - **Goal:** Perform a comprehensive end-to-end review and audit of the product management lifecycle (Create, Read, Update, Delete - CRUD). Analyze frontend (Angular), backend (.NET), database schema, and data flow to ensure functionality, data integrity, security, and adherence to project requirements and best practices.
    - **Context:** This is a core feature for store owners. While an initial implementation exists (marked complete in `TASKS.md`), a thorough audit is needed to verify its robustness, security, and data integrity across the full stack. Reference `ARCHITECTURE.md` for component locations and `REQUIREMENTS.md` (FR4.2.2) for functional requirements.
    - **Scope & Requirements:**
        *   **Frontend (`WebClient/`):**
            *   Analyze UI/UX of the product management component(s) (likely `ProductManagementComponent`) for clarity, usability, and form validation.
            *   Review `ItemService` API calls for correct payload structure, endpoint usage, and error handling.
        *   **Backend (`Server/`):**
            *   Review `ItemController` (and potentially `ImageController`) endpoints for authorization, input validation (server-side), correct data handling, and appropriate responses.
            *   Analyze `ItemService` (and potentially `ImageService`) logic for business rule enforcement and database interaction.
            *   Examine database interactions (EF Core/SQL queries) for correctness, efficiency, and use of transactions where necessary (especially for operations involving `Listing`, `Items`, and `ItemImages`).
        *   **Database (`Database/`):**
            *   Review `Listing`, `Items`, `ItemImages` table schemas (`TableCreation.sql`) for appropriate data types, constraints (NOT NULL, UNIQUE, FKs), and relationships.
            *   Analyze the `Quantity` trigger on the `Items` table for correctness and potential side effects.
        *   **Data Flow:** Trace product data (including variants and images) end-to-end for Create, Read (List & Detail), Update, and Delete operations to ensure integrity.
        *   **CRUD Operations:** Audit each operation:
            *   **Create:** Verify creation of `Listing`, associated `Items` (variants), and `ItemImages` (image URLs *per variant*). Check default status (Draft/Published based on `availFrom`).
            *   **Read:** Verify fetching product lists (for owner dashboard) and detailed product view (for editing and potentially customer view). Check filtering (e.g., by store).
            *   **Update:** Verify updating `Listing` details, adding/editing/deleting `Items` (variants), updating variant-specific images, and changing status (Draft/Published/Scheduled via `availFrom`/`availTo`).
            *   **Delete:** Verify deletion of `Listing` and cascading deletion of associated `Items` and `ItemImages`. Check for potential issues if product is part of an existing order.
        *   **Specific Features:** Pay close attention to the handling of product variants, image URLs associated *with specific variants*, and the Draft/Publish/Scheduled status logic tied to `availFrom`/`availTo` dates.
        *   **Security:** Ensure proper authorization checks on backend endpoints (user owns the store/product). Verify robust input validation on both client and server sides.
        *   **Error Handling:** Check for graceful error handling throughout the flow (UI feedback, API responses, logging).
        *   **Code Quality:** Ensure adherence to `.cursorrules` (simplicity, DRY, file size, comments for complex logic).
    - **Acceptance Criteria:**
        *   A thorough review of the E2E product lifecycle is completed.
        *   All identified issues (bugs, security vulnerabilities, data integrity problems, inconsistencies, usability issues, quality concerns) are documented clearly.
        *   Specific, actionable solutions (including code snippets where applicable) are proposed for each identified issue, adhering to `.cursorrules`.
        *   Potential impacts of the `Quantity` trigger are assessed.
        *   Handling of variant-specific images is verified.
        *   Draft/Publish/Scheduled status logic is confirmed.
        *   Any necessary documentation updates (`ARCHITECTURE.md`, `REQUIREMENTS.md`, etc.) are suggested.
    - **Files:**
        *   `WebClient/src/app/components/store-owner-layout/product-management/product-management.component.*` (and related services like `ItemService.ts`)
        *   `Server/Controllers/ItemController.cs`
        *   `Server/Controllers/ImageController.cs` (if used for product images)
        *   `Server/Services/ItemService.cs` (and related interfaces/repositories)
        *   `Server/Services/ImageService.cs` (if used)
        *   `Server/Models/Listing.cs`, `Server/Models/Item.cs`, `Server/Models/ItemImage.cs` (and related DTOs)
        *   `Server/Data/AppDbContext.cs`
        *   `Database/TableCreation.sql` (Focus on `Listing`, `Items`, `ItemImages`, `Categories` tables and `Quantity` trigger)
        *   `Documents/ARCHITECTURE.md`
        *   `Documents/REQUIREMENTS.md`
        *   `Documents/TASKS.md`
        *   `.cursorrules`
    - **Priority:** 🔥 High