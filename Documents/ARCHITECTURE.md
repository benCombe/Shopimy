# Shopimy - System Architecture

## 1. Introduction

This document outlines the architecture of the Shopimy platform, a web application designed for social media sellers to create and manage their online stores. It details the major components, their interactions, and the overall structure of the system.

## 2. High-Level Overview

Shopimy follows a standard **Client-Server Architecture**:

*   **Frontend (WebClient):** An Angular single-page application (SPA) responsible for the user interface, user interactions, and client-side logic.
*   **Backend (Server):** A .NET application providing a RESTful API for business logic, data management, and integration with external services.
*   **Database (SQL Server):** The persistent storage for all application data.
*   **External Services:** Third-party services integrated into the platform, primarily Stripe for payment processing.

## 3. Frontend Architecture (Angular - WebClient)

The frontend is built using Angular and is responsible for rendering the user interface and handling user interactions.

*   **Technology:** Angular `19.0.7` (`package.json`, `angular.json`), Stripe.js (`^6.1.0`), Chart.js (`^4.4.9`).
*   **Structure:** Component-based architecture (`app/components/`). Key areas include:
    *   `account/`: User registration, login, profile management.
    *   `customer-layout/`: Components for viewing stores (`StorePageComponent`), categories (`CategoryPageComponent`), items (`ItemPageComponent`, `ItemDetailComponent`), shopping cart (`ShoppingCartComponent`), and checkout (`CheckoutComponent`).
    *   `store-owner-layout/`: Dashboard (`StoreOwnerDashboardComponent`), store editor (`StoreEditorComponent`), product management (`ProductManagementComponent`), analytics (`AnalyticsComponent`), promotions (`PromotionsComponent`), orders (`OrdersComponent`), settings (`SettingsComponent`), themes (`ThemesComponent`), logo selector (`LogoSelectorComponent`).
    *   `shared/`: Reusable components. Includes shared components for individual store sections (`StoreHeaderComponent`, `HeroBannerComponent`, `FeaturedProductsComponent`, `TestimonialsComponent`, `NewsletterComponent`, `StoreFooterComponent`) ensuring consistency between the live store and editor preview (`StorePreviewComponent`).
    *   `utilities/`: Helper components like loading indicators (`LoadingOneComponent`, `LoadingTwoComponent`), popups (`PopupComponent`).
    *   Standalone Pages: `LandingPageComponent`, `BlogComponent`, `AboutUsComponent`, `ContactComponent`, `PrivacyPolicyComponent`, `TermsOfServiceComponent`, `DocsComponent`, `SupportComponent`, `PageNotFoundComponent`.
*   **Routing:** Managed by Angular Router (`app.routes.ts`) defining paths for public pages, store views, and the store owner dashboard. Dashboard routes are protected by `StoreOwnerGuard`.
*   **State Management:** Primarily managed through Angular Services (`app/services/`). Key services include:
    *   `UserService`: Handles user authentication state and profile data.
    *   `StoreService`: Manages active store data, theme information, and store creation/updates.
    *   `ShoppingService`: Manages the user's shopping cart state.
    *   `PaymentService`: Interacts with the backend for Stripe payment setup and processing.
    *   `AnalyticsService`: Fetches store analytic data.
    *   `OrderService`: Fetches order data for store owners.
    *   `PromotionsService`: Manages promotional codes.
    *   `CategoryService`: Manages product categories.
    *   `ItemService`: Manages product/item data (CRUD, image uploads).
    *   `LogoService`: Manages store logo uploads/retrieval.
    *   `ReviewService`: Fetches product reviews.
    *   `CookieService`: Handles browser cookie management (e.g., auth tokens).
    *   `LoadingService`: Manages global loading indicators.
    *   `StoreNavService`: Manages navigation state within a store context.
*   **API Communication:** Uses Angular's `HttpClient` (`app.config.ts`) to interact with the backend REST API. API base URL defined in `environments/environment.ts`.
*   **Payment Integration:** Uses `@stripe/stripe-js` (`package.json`) for client-side tokenization and interaction with Stripe Elements (within `ProfileComponent` for saved methods, potentially `CheckoutComponent` in future).

## 4. Backend Architecture (.NET - Server)

The backend is built using .NET and exposes a RESTful API.

*   **Technology:** .NET `9.0` (`Server.csproj`, `Program.cs`), Stripe.net (`47.4.0`).
*   **Structure:** Follows an API Controller pattern (`Controllers/`).
    *   `AccountController`: Handles user registration, login, logout, profile retrieval/update, and purchase history.
    *   `StoreController`: Fetches store details (including theme, components), creates/updates stores, logs store visits (`StoreVisits` table).
    *   `CategoriesController`: Manages product categories (CRUD), fetches item IDs by category/store.
    *   `ItemController`: Handles product/listing/variant CRUD operations. Manages image URLs associated with variants. *(Note: Audit identified logic directly in controller, potential lack of dedicated ItemService)*.
    *   `ImageController`: Handles file upload for product images (currently saves to filesystem).
    *   `LogoController`: Handles file upload/delete for store logos.
    *   `PaymentController`: Server-side Stripe integration (Checkout Session creation, Webhook handling for `checkout.session.completed`, `payment_intent.payment_failed`, etc.).
    *   `UserPaymentController`: Manages user-specific payment methods via Stripe (SetupIntents, save/list/delete/set default).
    *   `ShoppingCartController`: Manages shopping cart persistence for logged-in users.
    *   `ReviewsController`: Fetches product reviews and average ratings.
    *   `OrdersController`: Manages fetching orders for store owners and updating order status.
    *   `AnalyticsController`: Provides aggregated store performance analytics data (visits, sales, KPIs, top products).
    *   `PromotionsController`: Manages promotional codes (CRUD).
*   **Authentication & Authorization:** Uses JWT Bearer tokens (`Program.cs`, `AccountController.cs`). Tokens generated on login, validated for `[Authorize]` endpoints. `StoreClaimMiddleware` adds a `storeId` claim to the user's identity if they own a store.
*   **Data Access:** Primarily uses Entity Framework Core (`Data/AppDbContext.cs`) for database interaction. Repositories (`Repositories/`) abstract data access for some entities (`CategoryRepository`, `ReviewRepository`). Some raw SQL is used in controllers (`ItemController`, `OrdersController`, `AnalyticsController`).
*   **Service Layer:** Encapsulates business logic (`Services/`). Examples: `AnalyticsService`, `CategoryService`, `LogoService`, `PromotionsService`, `ReviewService`. *(Note: Item logic may reside directly in `ItemController`)*.
*   **Payment Integration:** Uses the `Stripe.net` library (`Server.csproj`) to interact with the Stripe API (`PaymentController.cs`, `UserPaymentController.cs`).
*   **Configuration:** Managed via `appsettings.json`, `appsettings.Development.json`, and `appsettings.secrets.json` (ignored by Git). Includes DB connection strings, JWT secrets, Stripe keys.
*   **CORS:** Configured in `Program.cs` to allow requests from the Angular frontend (`http://localhost:4200`).
*   **User Data Access:** Provides endpoints for users to access their own data: profile (`/api/account/profile`), purchase history (`/api/account/purchase-history`), payment methods (`/api/user-payment/methods`).

## 5. Database Architecture (SQL Server)

The database stores all persistent application data.

*   **Technology:** SQL Server
*   **Schema:** Defined in `Database/TableCreation.sql`. Key tables include:
    *   `Users`: Stores user account information, including `stripe_customer_id`, `city`, `state`, `postal_code`.
    *   `ActiveUsers`: Tracks currently logged-in user sessions and tokens.
    *   `Stores`: Information about created shops (`owner` FK to `Users`).
    *   `StoreThemes`: Customization data (colors, fonts, banner/logo text, `component_visibility` JSON string).
    *   `StoreBanners`: Banner image URLs.
    *   `StoreLogos`: Logo image URLs.
    *   `Categories`: Product categories, supports hierarchy (`parent_category`).
    *   `Listing`: Core product information (name, description, category FK).
    *   `Items`: Product variants (price, sale_price, quantity, type, size, colour). Has `Quantity` trigger (updates `Listing.quantity` on INSERT/UPDATE).
    *   `ItemImages`: Stores image URLs associated with specific items/variants.
    *   `ShoppingCarts`: Stores items added to carts by users.
    *   `Reviews`: Customer reviews and ratings for products.
    *   `Orders`: Main order details (user, store, date, total, status, address, Stripe IDs).
    *   `OrderItems`: Links orders to specific items purchased (product name, quantity, price paid).
    *   `StoreVisits`: Tracks visits to store pages (store_id, user_id, timestamp).
    *   `Promotions`: Discount code details and rules.
*   **Views:** `ItemsView` provides a combined view of `Listing` and `Items`.
*   **Data Initialization:** Sample data is provided in `Database/SampleData.sql`.

## 6. External Services Integration

*   **Stripe:**
    *   **Client-Side (Angular):** Stripe.js used for collecting payment information securely (Stripe Elements), creating PaymentMethod IDs, confirming SetupIntents.
    *   **Server-Side (.NET):** Backend interacts with Stripe API via `Stripe.net` library to:
        *   Create Stripe Customers (`UserPaymentController`).
        *   Create/Confirm SetupIntents (`UserPaymentController`).
        *   Attach/Detach/List/Set Default Payment Methods (`UserPaymentController`).
        *   Create Stripe Checkout Sessions (`PaymentController`).
        *   Handle Stripe Webhooks (e.g., `checkout.session.completed`, `payment_intent.payment_failed`) to update internal order status, manage inventory, and trigger notifications (`PaymentController`).

## 7. Data Flow Examples

*   **User Login:**
    1.  User submits email/password via Angular `LoginComponent`.
    2.  `UserService` sends credentials to Backend `/api/account/login`.
    3.  `AccountController` verifies credentials against `Users` table (using BCrypt).
    4.  If valid, generates a JWT token (including user ID).
    5.  Stores token and user ID in `ActiveUsers` table.
    6.  Returns JWT token and basic user info to the frontend.
    7.  Frontend stores token (via `CookieService`) and updates user state (`UserService.activeUser$`).
    8.  Subsequent requests include the token. `StoreClaimMiddleware` adds `storeId` claim if applicable.
*   **Store Page View:**
    1.  User navigates to `/:storeUrl`.
    2.  Angular Router maps to `StorePageComponent`.
    3.  `StorePageComponent` extracts `storeUrl`.
    4.  `StoreService` calls Backend `/api/store/{storeUrl}`.
    5.  `StoreController` fetches data from `Stores`, `StoreThemes`, `StoreBanners`, `StoreLogos`, `Categories` tables.
    6.  `StoreController` logs a record in `StoreVisits` table.
    7.  Backend returns `StoreDetails` object (including theme and `componentVisibility` JSON).
    8.  `StoreService` deserializes `componentVisibility` and updates `activeStore$` BehaviorSubject.
    9.  `StorePageComponent` and shared child components (`StoreHeaderComponent`, `HeroBannerComponent`, etc.) react to updated data and conditionally render based on `componentVisibility`.
*   **Checkout:**
    1.  User proceeds from cart (`ShoppingCartComponent`) to `CheckoutComponent`.
    2.  `CheckoutComponent` gets cart items (`List<CheckoutItem>`) from `ShoppingService` and store details (`storeUrl`, `storeId`) from `StoreService`.
    3.  `PaymentService` calls Backend `/api/payment/create-checkout-session` with items, `storeUrl`, `storeId`.
    4.  `PaymentController` creates an `Order` record ('Pending') and `OrderItems` in the database.
    5.  `PaymentController` uses Stripe API to create a Checkout Session, passing the internal `OrderId` in metadata and constructing `SessionLineItemOptions` from the item list.
    6.  Backend saves `StripeSessionId` to the `Order` record.
    7.  Backend returns the Stripe Session URL/ID.
    8.  Frontend redirects user to Stripe Checkout.
    9.  User completes payment on Stripe.
    10. Stripe redirects user to `SuccessUrl` or `CancelUrl`.
    11. Stripe sends `checkout.session.completed` webhook to Backend `/api/payment/webhook`.
    12. `PaymentController` webhook handler verifies signature, finds internal `Order` via metadata, updates status (e.g., 'Paid'), decreases stock (`Items` table), and potentially triggers email notifications.
*   **Order Viewing (Store Owner):**
    1.  Store owner navigates to the orders page in the dashboard (`OrdersComponent`).
    2.  `OrderService` calls Backend `/api/orders` (with authentication token).
    3.  `OrdersController` verifies token, retrieves `storeId` from claims.
    4.  `OrdersController` fetches orders for that store from `Orders` and `OrderItems` tables, joining with `Users` for customer details.
    5.  Backend returns the list of `Order` objects.
    6.  `OrdersComponent` displays the orders.
*   **Store Analytics View:**
    1.  Store owner navigates to the analytics page (`AnalyticsComponent`).
    2.  `AnalyticsService` calls Backend endpoints like `/api/analytics/store-visits` (with auth token).
    3.  `AnalyticsController` verifies token, gets `storeId` from claims.
    4.  `AnalyticsController` (via `AnalyticsService`) queries `StoreVisits`, `Orders`, `OrderItems` tables, aggregating data by specified time period.
    5.  Backend returns aggregated data (e.g., `{ labels: [...], data: [...] }`).
    6.  `AnalyticsComponent` uses Chart.js to display the data.

## 8. Deployment Overview (Conceptual)

*   **Frontend (Angular):** Built into static assets (`ng build`) and served by a web server (like Nginx, Apache, or cloud static hosting like Azure Blob Storage/AWS S3 + CDN). Requires SPA routing configuration (fallback to `index.html`).
*   **Backend (.NET):** Deployed as a web application (e.g., Azure App Service, AWS Elastic Beanstalk, IIS, Docker). Requires configuration via environment variables/secrets management for connection strings, JWT keys, Stripe keys. Needs `wwwroot` configured for static file serving (e.g., uploaded logos/images if using filesystem storage).
*   **Database (SQL Server):** Hosted on a dedicated database server or cloud service (e.g., Azure SQL Database, AWS RDS).

Configuration (API URLs, keys) should be managed via environment variables or configuration files specific to each deployment environment. See `Documents/DEPLOYMENT.md` for more details.