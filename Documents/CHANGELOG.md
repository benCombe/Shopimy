# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Analytics Dashboard**: Implemented real-time analytics for store owners with:
  - Key Performance Indicators (KPIs) showing orders, revenue, visits, and conversion rates
  - Sales trend charts with daily/weekly/monthly view options
  - Store visit statistics with time period filtering
  - Data caching to improve performance and reduce database load
  - Fallback sample data for development environment when no real data exists
- Blog page accessible at /blog route
- Initial blog layout with placeholder posts
- Responsive design for blog content

### Changed
- *(Add changes to existing functionality here)*

### Fixed
- Fixed analytics API endpoints to properly handle database queries and error conditions
- Resolved Chart.js rendering issues when data sets are empty

---

## [0.1.0] - YYYY-MM-DD _(Initial Development Snapshot)_

This represents the initial set of features and structure developed for the Shopimy platform.

### Added

-   **Core Application Structure:**
    -   Established Client-Server architecture with Angular frontend (`WebClient`) and .NET backend (`Server`).
    -   Configured basic project setup, build processes, and routing (`angular.json`, `Server.csproj`, `Program.cs`, `app.routes.ts`).
    -   Defined database schema using SQL Server (`Database/TableCreation.sql`) including tables for Users, Stores, Categories, Items, Carts, Themes, Banners, Logos, Reviews, etc.
    -   Added sample data for testing and development (`Database/SampleData.sql`).
    -   Implemented Entity Framework Core for data access (`Data/AppDbContext.cs`).
    -   Created initial database migrations (`Server/Migrations/`).
-   **User Authentication & Account Management:**
    -   User registration functionality (`AccountController`, `RegisterComponent`).
    -   User login/logout with JWT authentication (`AccountController`, `LoginComponent`, `UserService`).
    -   Password hashing using BCrypt.
    -   Basic user profile viewing (`AccountController`, `ProfileComponent` - Store Owner Layout).
    -   Added `StripeCustomerId` field to User model for payment integration.
-   **Store & Product Functionality:**
    -   API endpoint to fetch store details including theme, banner, logo, and categories (`StoreController`, `StoreDetails` model).
    -   API endpoints to fetch items by store or category (`CategoriesController`, `ItemController`).
    -   Basic item model (`BasicItem`, `Item` models).
    -   Category model supporting hierarchy (`Category` model).
    -   Frontend components for displaying store pages, category pages, and item cards (`StorePageComponent`, `CategoryPageComponent`, `ItemCardComponent`).
-   **Shopping & Checkout:**
    -   Basic shopping cart functionality (add/remove items) (`ShoppingCartController`, `ShoppingService`, `ShoppingCartComponent`).
    -   Basic checkout component structure (`CheckoutComponent`).
-   **Payment Integration (Stripe):**
    -   Added Stripe dependencies (`@stripe/stripe-js` frontend, `Stripe.net` backend).
    -   Backend endpoints for creating Stripe Checkout Sessions (`PaymentController`).
    -   Backend endpoint for handling Stripe webhooks (`PaymentController`).
    -   Backend endpoints for managing user payment methods via Stripe (SetupIntents, save/list/delete methods) (`UserPaymentController`).
    -   Frontend service (`PaymentService`) to interact with backend payment endpoints.
-   **Reviews & Ratings:**
    -   Backend API and service for retrieving product reviews and average ratings (`ReviewsController`, `ReviewService`, `ReviewRepository`).
    -   Frontend component to display product reviews (`ProductReviewsComponent`).
-   **Store Owner Dashboard:**
    -   Basic dashboard layout with side navigation (`StoreOwnerDashboardComponent`, `SideNavComponent`).
    -   Placeholder components for Overview, Profile, Settings, Products, Orders, Themes, Promotions, Analytics.
    -   Store Editor structure with component selection and preview (`StoreEditorComponent`, `StorePreviewComponent`).
    -   Theme Selector component (`ThemeSelectorComponent`).
-   **Development & Documentation:**
    -   Established development rules and AI collaboration guidelines (`.cursorrules`).
    -   Created initial project documentation (`README.md`, `REQUIREMENTS.md`, `ARCHITECTURE.md`).
    -   Set up basic CORS configuration for development (`Program.cs`).
    -   Included basic unit/integration tests structure (`Server/Tests/`).
    -   Added utility components (Loading indicators, Popups).