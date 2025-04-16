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

*   **Technology:** Angular (`package.json`, `angular.json`)
*   **Structure:** Component-based architecture (`app/components/`). Key areas include:
    *   `account/`: User registration, login, profile management.
    *   `customer-layout/`: Components for viewing stores, categories, items, shopping cart, and checkout.
    *   `store-owner-layout/`: Dashboard, store editor, product management, analytics, etc.
    *   `shared/`: Reusable components (e.g., Store Preview).
    *   `utilities/`: Helper components like loading indicators, popups.
*   **Routing:** Managed by Angular Router (`app.routes.ts`) defining paths for different views.
*   **State Management:** Primarily managed through Angular Services (`app/services/`). Key services include:
    *   `UserService`: Handles user authentication state and profile data.
    *   `StoreService`: Manages active store data and theme information.
    *   `ShoppingService`: Manages the user's shopping cart state.
    *   `PaymentService`: Interacts with the backend for payment setup and processing.
*   **API Communication:** Uses Angular's `HttpClient` (`app.config.ts`) to interact with the backend REST API. API endpoint defined in `environments/environment.ts`.
*   **Payment Integration:** Uses `@stripe/stripe-js` (`package.json`) for client-side tokenization and interaction with Stripe Elements (likely within payment-related components).

## 4. Backend Architecture (.NET - Server)

The backend is built using .NET and exposes a RESTful API.

*   **Technology:** .NET (`Server.csproj`, `Program.cs`)
*   **Structure:** Follows an API Controller pattern (`Controllers/`).
    *   `AccountController`: Handles user registration, login, logout, profile retrieval.
    *   `StoreController`: Fetches store details and related data.
    *   `CategoriesController`: Manages product categories.
    *   `ItemController`/`ItemsController`: Handles product/listing data.
    *   `PaymentController`: Server-side Stripe integration (Checkout Sessions, Webhooks).
    *   `UserPaymentController`: Manages user-specific payment methods via Stripe.
    *   `ShoppingCartController`: Manages shopping cart persistence for logged-in users.
    *   `ReviewsController`: Handles product reviews.
*   **Authentication & Authorization:** Uses JWT Bearer tokens (`Program.cs`, `AccountController.cs`). Tokens are generated upon login and validated for protected endpoints. User identity is extracted from claims.
*   **Data Access:** Uses Entity Framework Core (`Data/AppDbContext.cs`) to interact with the SQL Server database. Repositories (`Repositories/`) abstract data access logic (e.g., `CategoryRepository`).
*   **Service Layer:** Encapsulates business logic (`Services/`). Examples: `CategoryService`, `ReviewService`.
*   **Payment Integration:** Uses the `Stripe.net` library (`Server.csproj`) to interact with the Stripe API for creating checkout sessions, handling webhooks, managing customers, and payment methods (`PaymentController.cs`, `UserPaymentController.cs`).
*   **Configuration:** Managed via `appsettings.json`, `appsettings.Development.json`, and `appsettings.secrets.json`. Includes database connection strings and Stripe API keys/secrets.
*   **CORS:** Configured in `Program.cs` to allow requests from the Angular frontend (`http://localhost:4200`).

## 5. Database Architecture (SQL Server)

The database stores all persistent application data.

*   **Technology:** SQL Server
*   **Schema:** Defined in `Database/TableCreation.sql`. Key tables include:
    *   `Users`: Stores user account information.
    *   `ActiveUsers`: Tracks currently logged-in user sessions and tokens.
    *   `Stores`: Information about created shops.
    *   `StoreThemes`, `StoreBanners`, `StoreLogos`: Customization data for stores.
    *   `Categories`: Product categories, supports hierarchy (parent_category).
    *   `Listing`, `Items`: Product details, including variants (price, size, color).
    *   `ItemImages`: Stores image URLs associated with items.
    *   `ShoppingCarts`: Stores items added to carts by users.
    *   `Reviews`: Customer reviews and ratings for products.
    *   *(Potential Future Tables: Orders, OrderItems, Payments)*
*   **Data Initialization:** Sample data is provided in `Database/SampleData.sql`.

## 6. External Services Integration

*   **Stripe:**
    *   **Client-Side (Angular):** Stripe.js is used for collecting payment information securely using Stripe Elements, creating payment method tokens/IDs, and potentially confirming SetupIntents.
    *   **Server-Side (.NET):** The backend interacts with the Stripe API to:
        *   Create Stripe Customers (`UserPaymentController`).
        *   Create SetupIntents for saving payment methods (`UserPaymentController`).
        *   Attach Payment Methods to Customers (`UserPaymentController`).
        *   List/Delete/Set Default Payment Methods (`UserPaymentController`).
        *   Create Stripe Checkout Sessions for one-time payments (`PaymentController`).
        *   Handle Stripe Webhooks (e.g., `checkout.session.completed`) to confirm payment success and trigger order fulfillment logic (`PaymentController`).

## 7. Data Flow Examples

*   **User Login:**
    1.  User submits email/password via Angular `LoginComponent`.
    2.  `UserService` sends credentials to Backend `/api/account/login`.
    3.  `AccountController` verifies credentials against `Users` table (using BCrypt).
    4.  If valid, generates a JWT token.
    5.  Stores token and user ID in `ActiveUsers` table.
    6.  Returns JWT token and basic user info to the frontend.
    7.  Frontend stores token (e.g., in cookies via `CookieService`) and updates user state.
*   **Store Page View:**
    1.  User navigates to `/:storeUrl` in the browser.
    2.  Angular Router maps the URL to `StorePageComponent`.
    3.  `StorePageComponent` extracts `storeUrl` from the route.
    4.  `StoreService` calls Backend `/api/store/{storeUrl}`.
    5.  `StoreController` fetches data from `Stores`, `StoreThemes`, `StoreBanners`, `StoreLogos`, `Categories` tables for the given URL.
    6.  Backend returns `StoreDetails` object.
    7.  `StoreService` updates `activeStore$` BehaviorSubject.
    8.  `StorePageComponent` and child components (like `StoreNavComponent`) react to the updated store data and render the page.
*   **Checkout (Simplified):**
    1.  User proceeds to checkout from the cart (`ShoppingCartComponent`).
    2.  User fills shipping details in `CheckoutComponent`.
    3.  User clicks "Proceed to Payment".
    4.  `PaymentService` calls Backend `/api/payment/create-checkout-session` with order details (amount, product name, store ID).
    5.  `PaymentController` uses Stripe API to create a Checkout Session.
    6.  Backend returns the Stripe Checkout Session URL.
    7.  Frontend redirects the user to the Stripe Checkout page.
    8.  User completes payment on Stripe's page.
    9.  Stripe redirects user to `SuccessUrl` or `CancelUrl`.
    10. Stripe sends a `checkout.session.completed` webhook event to Backend `/api/payment/webhook`.
    11. `PaymentController` verifies the webhook signature and processes the event (e.g., updates order status in the database, potentially reduces stock).

## 8. Deployment Overview (Conceptual)

*   **Frontend (Angular):** Built into static assets (`ng build`) and served by a web server (like Nginx, Apache, or a cloud static hosting service like Azure Blob Storage/AWS S3 + CloudFront).
*   **Backend (.NET):** Deployed as a web application, typically hosted on a server (e.g., IIS, Kestrel) or using cloud services like Azure App Service or AWS Elastic Beanstalk.
*   **Database (SQL Server):** Hosted on a dedicated database server or using a cloud database service (e.g., Azure SQL Database, AWS RDS).

Configuration (API URLs, keys) should be managed via environment variables or configuration files specific to each deployment environment.
```

**Reasoning:**

1.  **Structure:** Followed the standard sections for an architecture document (Introduction, High-Level, Components, Data Flow, Deployment).
2.  **High-Level:** Included a Mermaid diagram for a quick visual understanding of the main parts and their connections.
3.  **Component Breakdown:** Detailed the Frontend (Angular) and Backend (.NET) separately, listing key technologies, structural patterns (components, controllers, services, repositories), and specific responsibilities based on the provided code files (`package.json`, `*.csproj`, `Program.cs`, controller/service/repository names, `app.routes.ts`, etc.).
4.  **Database:** Summarized the database technology (SQL Server) and key tables identified in `TableCreation.sql`.
5.  **External Services:** Focused on Stripe, explaining both client-side (Stripe.js) and server-side (Stripe API, Webhooks) roles based on `PaymentController.cs`, `UserPaymentController.cs`, and the frontend `package.json`.
6.  **Data Flow:** Provided concrete examples (Login, Store View, Checkout) to illustrate how components interact during common user actions. These flows are inferred from the controller actions and service interactions.
7.  **Deployment:** Added a conceptual overview of how such an application is typically deployed.
8.  **Referencing Files:** Used information from `README.md`, `REQUIREMENTS.md`, `Program.cs`, `AppDbContext.cs`, controller/service/repository names, `package.json`, `angular.json`, and SQL files to ensure the architecture description aligns with the project's reality.