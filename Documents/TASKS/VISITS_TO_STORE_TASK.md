# TASK: Implement "Visits to Store" Widget with Real Data

**Goal:** Replace the dummy data in the "Visits to Store" widget on the Store Owner Dashboard Overview page with actual store visit data fetched from the backend.

**Context:**
*   The `OverviewComponent` currently displays a "Visits to Store" chart using static/dummy data.
*   The application currently does not track store page visits.
*   A mechanism to log visits and an API endpoint to retrieve aggregated visit data are required.

**Requirements / Acceptance Criteria:**

1.  **Database Schema:**
    *   A new table `StoreVisits` must be added to the database schema (`Database/TableCreation.sql`) to log individual visits.
    *   The table should include at least `visit_id` (PK, auto-increment), `store_id` (FK to Stores), `visit_timestamp` (DATETIME2, default to current UTC time), and potentially `user_id` (FK to Users, nullable for guest visits) or `ip_address` (nullable).
2.  **Backend - Visit Logging:**
    *   Modify the backend endpoint responsible for serving the public store page (likely in `Server/Controllers/StoreController.cs`, e.g., `GetStoreDetails`) to insert a new record into the `StoreVisits` table each time a store page is successfully retrieved.
    *   Ensure logging happens *after* successfully fetching store data to avoid logging failed attempts.
    *   Handle potential errors during the logging insert gracefully (e.g., log the error but don't fail the main store page request).
3.  **Backend - Analytics API Endpoint:**
    *   Create a new controller (e.g., `AnalyticsController.cs`) or add to an existing relevant controller.
    *   Implement a secure API endpoint (e.g., `GET /api/analytics/store-visits`) that requires authentication (`[Authorize]`).
    *   The endpoint should retrieve the `store_id` associated with the authenticated user.
    *   The endpoint should accept optional query parameters for time period (e.g., `?period=daily&days=7`, `?period=monthly&months=6`). Default to daily for the last 7 days if not specified.
    *   The endpoint must query the `StoreVisits` table, aggregate visit counts by the specified time period (day, week, month) for the user's store, and return the data.
    *   The response format should be suitable for a chart, e.g.:
        ```json
        {
          "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], // Or dates, months
          "data": [15, 25, 10, 30, 45, 20, 18] // Corresponding visit counts
        }
        ```
4.  **Frontend - Analytics Service:**
    *   Create or update an `AnalyticsService` (`WebClient/src/app/services/analytics.service.ts`) if it doesn't exist.
    *   Add a method (e.g., `getStoreVisits(period: string, range: number): Observable<any>`) to call the new backend API endpoint, including the authentication token.
5.  **Frontend - Overview Component:**
    *   Inject the `AnalyticsService` into `OverviewComponent` (`WebClient/src/app/components/store-owner-layout/overview/overview.component.ts`).
    *   On component initialization (`ngOnInit`), call the `getStoreVisits` method from the service (e.g., for the last 7 days).
    *   Replace the dummy data used for the "Visits to Store" chart (likely Chart.js) with the data fetched from the service.
    *   Update the chart labels and data points dynamically based on the API response.
    *   Implement basic loading and error handling states for the chart data fetching.
6.  **Testing:**
    *   Add basic backend unit/integration tests for the new API endpoint.
    *   Manually verify that visits are logged when viewing a store page.
    *   Manually verify the chart displays data corresponding to logged visits.
7.  **Documentation:**
    *   Update `Database/TableCreation.sql` with the new table definition.
    *   Update `Documents/ARCHITECTURE.md` to include the new table, the visit logging mechanism, the new API endpoint, and the `AnalyticsService`.

**Files Potentially Affected:**
*   `Database/TableCreation.sql`
*   `Server/Controllers/StoreController.cs`
*   `Server/Controllers/AnalyticsController.cs` (New)
*   `Server/Data/AppDbContext.cs`
*   `Server/Models/*` (New model for StoreVisit, potentially Analytics response model)
*   `WebClient/src/app/services/analytics.service.ts` (New or Updated)
*   `WebClient/src/app/components/store-owner-layout/overview/overview.component.ts`
*   `WebClient/src/app/components/store-owner-layout/overview/overview.component.html`
*   `Documents/ARCHITECTURE.md`
*   `Server/Tests/*` (New test file)

**Priority:** 🔥 High