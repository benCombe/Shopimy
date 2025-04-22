**Task Outline:**

1.  **Analyze Existing Code and Requirements:**
    *   Review `WebClient/src/app/components/store-owner-layout/profile/profile.component.html` to understand the current dummy table structure.
    *   Review `WebClient/src/app/components/store-owner-layout/profile/profile.component.ts` to identify where purchase history data is stored (`purchaseHistory`) and where data fetching logic should be added.
    *   Examine `WebClient/src/app/services/purchase.service.ts` to see its current structure and identify the need for a new method to fetch history.
    *   Analyze backend database schema (`Database/TableCreation.sql`) focusing on `Users`, `Orders`, and `OrderItems` tables to understand the data structure for purchases made by a user.
    *   Review `Server/Controllers/AccountController.cs` as a potential location for a new user-specific purchase history endpoint (since it handles user profile).
    *   Review `Server/Controllers/OrdersController.cs` to understand how order data is currently queried (though it's for *store owners*).
    *   Confirm the user ID can be retrieved from authenticated user claims in the backend.
    *   Note the pagination variables already present in `ProfileComponent.ts` (`currentPage`, `itemsPerPage`, `totalPages`).

2.  **Implement Backend API Endpoint:**
    *   Add a new `[HttpGet("purchase-history")]` endpoint to `Server/Controllers/AccountController.cs`.
    *   Ensure the endpoint is protected with `[Authorize]`.
    *   Inside the endpoint, retrieve the authenticated user's ID from claims.
    *   Implement a database query (using EF Core or raw SQL) to:
        *   Select orders from the `Orders` table where `user_id` matches the authenticated user's ID.
        *   Join with `OrderItems` to get details of products within each order.
        *   Optionally join with `Stores` to get the store name for each order.
        *   Order results by `order_date` descending.
        *   Implement server-side pagination based on `page` and `itemsPerPage` query parameters.
    *   Define a suitable response DTO/model (e.g., `PurchaseHistoryResponseDTO`) that includes the list of orders and the total count (for pagination). Each order in the list should include relevant details (Date, Store Name, Total Amount, Status) and a list of its items (Product Name, Quantity, Price Paid).
    *   Return the paginated data.

3.  **Update Frontend Service:**
    *   Modify `WebClient/src/app/services/purchase.service.ts`.
    *   Add a method `getPurchaseHistory(userId: number, page: number, itemsPerPage: number): Observable<PurchaseHistoryResponse>`.
    *   This method should construct the API call to the new backend endpoint (`/api/account/purchase-history`), including the user ID (though the backend will re-verify it from the token), pagination query parameters, and authentication headers.
    *   Define frontend interfaces (`PurchaseHistoryResponse`, `OrderHistoryItem`, `OrderHistoryProduct`) mirroring the backend response structure.

4.  **Integrate Frontend Component:**
    *   Modify `WebClient/src/app/components/store-owner-layout/profile/profile.component.ts`.
    *   Inject `PurchaseService`.
    *   Add properties to manage purchase history data (`purchaseHistory`), loading state (`isLoadingHistory`), error state (`historyError`), and pagination (`currentPage`, `itemsPerPage`, `totalPages`). Initialize `currentPage = 1`, `itemsPerPage = 10`.
    *   Implement a method `loadPurchaseHistory(page: number)` that:
        *   Sets `isLoadingHistory = true`.
        *   Calls `purchaseService.getPurchaseHistory(page, this.itemsPerPage)` with the current user ID, `page`, and `itemsPerPage`.
        *   Subscribes to the observable.
        *   On success, updates `purchaseHistory` and `totalPages`, sets `isLoadingHistory = false`.
        *   On error, sets `historyError`, sets `isLoadingHistory = false`.
    *   Call `loadPurchaseHistory(this.currentPage)` when the 'history' tab is activated (`setActiveTab`).
    *   Implement `previousPage()` and `nextPage()` methods that update `currentPage` and call `loadPurchaseHistory()`.
    *   Modify `WebClient/src/app/components/store-owner-layout/profile/profile.component.html`.
    *   Locate the Purchase History tab content (`*ngIf="isTabActive('history')"`).
    *   Add loading indicator (`*ngIf="isLoadingHistory"`).
    *   Add error message display (`*ngIf="historyError"`).
    *   Add an empty state message (`*ngIf="!isLoadingHistory && !historyError && purchaseHistory.length === 0"`).
    *   Replace the dummy `<tr>` elements in the table body with an `*ngFor="let order of purchaseHistory"`.
    *   Bind the table cells (`<td>`) to display `order.orderDate`, `order.storeName`, a summary of `order.items` (e.g., "X items"), `order.totalAmount`, and `order.status`.
    *   Add pagination controls (buttons for Previous/Next, display of current page / total pages) below the table. Bind button clicks to `previousPage()` and `nextPage()`. Disable buttons when on the first/last page or loading.

5.  **Testing:**
    *   Manually test the Purchase History tab in the dashboard:
        *   Verify it loads correctly with actual data.
        *   Test pagination (if multiple pages of data exist).
        *   Test loading and error states (simulate by temporarily breaking the API call).
        *   Verify data displayed in the table is correct.
    *   If possible, add basic backend integration tests for the new API endpoint.

6.  **Documentation:**
    *   Update `Documents/TASKS.md` to mark this task as completed.
    *   Update `Documents/ARCHITECTURE.md` to mention the new API endpoint for purchase history.
