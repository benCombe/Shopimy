# TASK: Implement Dashboard Analytics Tab

**Feature:** Add a new "Analytics" tab to the Store Owner Dashboard (`/dashboard`). This tab will display key performance indicators (KPIs) and visualizations to help store owners understand their store's performance.

**Goal:** Provide store owners with actionable insights into their sales, traffic, and product performance through intuitive charts and data summaries.

**Context:**
*   The dashboard currently has sections like Overview, Products, Orders, etc. A new "Analytics" section is needed.
*   The application tracks `StoreVisits` (logged in `StoreController`).
*   Order data is available in the `Orders` and `OrderItems` tables.
*   Product data is in the `Listing` and `Items` tables.
*   Chart.js is available as a frontend dependency (`package.json`).
*   The backend uses JWT for authorization, and store-specific data should be fetched based on the authenticated user's store ID (retrieved from claims).

**Requirements:**

1.  **Backend (`Server/`):**
    *   Create a new `AnalyticsController.cs` in `Server/Controllers/`.
    *   Implement API endpoints within `AnalyticsController` protected by `[Authorize]`.
        *   Endpoint to fetch sales data (Revenue, Orders, Average Order Value) aggregated over time (e.g., daily for the last 30 days, monthly for the last 12 months). Should accept time range parameters.
        *   Endpoint to fetch top-selling products (by quantity and/or revenue) for a given period.
        *   Endpoint to fetch key KPIs (e.g., Total Revenue (all time), Total Orders (all time), Average Order Value (all time), Total Visits (all time)).
    *   Create a new `AnalyticsService.cs` (and `IAnalyticsService.cs`) in `Server/Services/` to encapsulate the business logic for fetching and aggregating analytics data from the database (`Orders`, `OrderItems`, `StoreVisits`, `Listing`, `Items`).
    *   Ensure all backend logic correctly filters data based on the `storeId` retrieved from the authenticated user's claims.
    *   Register the new service in `Program.cs`.

2.  **Frontend (`WebClient/`):**
    *   Create a new `AnalyticsComponent` (`analytics.component.ts`, `.html`, `.css`) in `WebClient/src/app/components/store-owner-layout/analytics/`.
    *   Update `SideNavComponent` (`side-nav.component.ts`, `.html`) to add an "Analytics" link/item (likely under the "Analytics" dropdown).
    *   Update `StoreOwnerDashboardComponent` (`store-owner-dashboard.component.ts`, `.html`) to conditionally display the `AnalyticsComponent` when the corresponding nav item is selected.
    *   Update `AnalyticsService` (`analytics.service.ts`) in `WebClient/src/app/services/` to include methods for calling the new backend API endpoints (e.g., `getSalesData`, `getTopProducts`, `getKpis`). Ensure authentication headers are included.
    *   Implement the UI in `AnalyticsComponent.html` to display:
        *   KPI Cards: Show key metrics like Total Revenue, Total Orders, Average Order Value, Total Visits.
        *   Sales Trend Chart: Use Chart.js to display Revenue and/or Number of Orders over a selected time period (e.g., Line chart). Allow users to select the time range (e.g., Last 7 days, Last 30 days, Last 12 months).
        *   Top Products List/Chart: Display the top 5-10 selling products (e.g., using a Bar chart or a simple table).
    *   Implement logic in `AnalyticsComponent.ts` to fetch data using `AnalyticsService` and update the charts/KPIs.
    *   Include basic loading indicators and error handling messages in the component.
    *   Ensure the component adheres to the established dashboard styling (`styles.css`, `README-STYLES.md`).

**Acceptance Criteria:**
*   An "Analytics" link is present in the dashboard side navigation.
*   Clicking the link displays the `AnalyticsComponent`.
*   The component displays KPI cards with relevant store metrics.
*   A chart shows sales trends over a selectable time period.
*   A chart or table displays the top-selling products.
*   All data displayed is specific to the logged-in store owner's store.
*   Backend endpoints are secure and require authentication.
*   Basic loading and error states are handled in the UI.

**Files Likely Involved:**
*   `Server/Controllers/AnalyticsController.cs` (New)
*   `Server/Services/AnalyticsService.cs` (New)
*   `Server/Services/IAnalyticsService.cs` (New)
*   `Server/Program.cs`
*   `Server/Data/AppDbContext.cs` (Reference)
*   `WebClient/src/app/components/store-owner-layout/analytics/analytics.component.*` (New)
*   `WebClient/src/app/services/analytics.service.ts` (Update or New)
*   `WebClient/src/app/components/store-owner-layout/side-nav/side-nav.component.*` (Update)
*   `WebClient/src/app/components/store-owner-layout/store-owner-dashboard/store-owner-dashboard.component.*` (Update)
*   `WebClient/package.json` (Reference - Chart.js)
*   `WebClient/src/styles.css` (Reference)
*   `WebClient/src/README-STYLES.md` (Reference)

**Priority:** 🔥 High