# Shopimy - Project Tasks & TODO List

This document tracks pending tasks, potential improvements, and areas needing attention for the Shopimy project. Check items off as they are completed and add new tasks as they arise during development.

**Priority Legend:**
*   🔥 **High:** Critical functionality, blocking issues.
*   ⚠️ **Medium:** Important features or improvements.
*   🧊 **Low:** Nice-to-haves, minor tweaks, future considerations.

---

## 🔥 Core Features & Bug Fixes

### Authentication & User Management
-   [ ] 🔥 **Implement Email Sending Service:** Integrate a service (SendGrid, Mailgun, SMTP) for sending transactional emails. (`EMAIL_MANAGEMENT.md`, `Program.cs`)
-   [ ] ⚠️ **Define IEmailService Interface:** Create the `IEmailService` interface in `Server/Services/IEmailService.cs` with necessary methods (e.g., `Task SendOrderConfirmationEmailAsync(User user, Order order);`).
-   [ ] ⚠️ **Implement EmailService:** Create the `EmailService` class in `Server/Services/EmailService.cs` implementing `IEmailService`. Include logic for connecting to the chosen email provider and handling configuration/secrets. (Depends on choosing a provider in the task above).
-   [ ] ⚠️ **Verify EmailService DI Registration:** Ensure `builder.Services.AddScoped<IEmailService, EmailService>();` (or similar) is correctly configured in `Program.cs` once the interface and implementation exist.
-   [ ] 🔥 **Implement Email Verification Flow:** Send verification email upon registration and check `User.Verified` status during login/access control. (`AccountController`, `UserService`, `REQUIREMENTS.md FR4.1.5`)
-   [ ] ⚠️ **Implement Password Reset Flow:** Create UI, backend logic, and email sending for password resets. (`AccountController`, `UserService`, `REQUIREMENTS.md FR4.1.6`)
-   [ ] 🧊 **Implement Social Logins:** Add Google/Facebook OAuth login functionality. (`LoginComponent`, `AccountController`)
-   [ ] ⚠️ **Refine User Profile Update:** Ensure all relevant user fields can be updated securely via the profile page and backend. (`ProfileComponent` - Store Owner, `AccountController`)

### Store & Product Management (Seller)
-   [X] 🔥 **Implement Full Product Management Lifecycle:** Refactored UI and backend logic for adding, editing (including variants and image URLs per variant), and deleting products. Implemented Draft/Publish functionality using `availFrom` date. (`ProductManagementComponent.ts`, `ItemService.ts`, `ItemController.cs`, `ImageController.cs`)
-   [X] 🔥 **Implement Category Management UI:** Create forms and logic for adding, editing (including parent), and deleting categories. (`CategoryListComponent`, `CategoryFormComponent` - needs creation/integration, `CategoriesController`)
-   [ ] ⚠️ **Implement Theme/Logo/Banner Saving:** Connect the frontend theme/logo/banner selectors to backend endpoints to persist customization changes. (`ThemesComponent`, `LogoSelectorComponent`, `StoreController` needs update endpoints)
-   [ ] ⚠️ **Implement Store Component Visibility:** Allow sellers to toggle component visibility (e.g., featured products, testimonials) and persist this configuration. Reflect this visibility on the public store page. (`StoreEditorComponent`, `StorePageComponent`, needs backend storage)
-   [X] 🔥 **Implement Order Management View:** Create UI for sellers to view incoming orders and their details. (`OrdersComponent`, `REQUIREMENTS.md FR4.2.4`, needs backend data source)
-   [X] 🔥 **Connect Management Components to Live Backend (Backend & Services):**
    -   **Status:** Mostly complete. Backend APIs (`ItemController`, `CategoriesController`, `OrdersController`, `ImageController`), DB structure, and frontend services (`ItemService`, `CategoryService`, `OrderService`, `ImageService`) updated. `ProductManagementComponent` updated.
    -   **Remaining:** Verify/update other management components (`CategoryListComponent`, `OrdersComponent`) if they were affected or need similar refactoring. Improve error handling/loading states across all components.
-   [X] ⚠️ **Verify & Update Frontend Management Components:**
    -   **Description:** `ProductManagementComponent` updated to handle variant-specific image uploads (via URLs), draft/publish using `availFrom`, and manage variant add/remove during edits. Logic for CRUD operations verified. `ItemService` interfaces updated.
    -   **Files:** `ProductManagementComponent.ts`, `ProductManagementComponent.html`, `ItemService.ts`, `ImageController.cs`, `ItemController.cs`
-   [ ] 🧊 **Refine Product Management CSS:** Update styles in `ProductManagementComponent.css` for new status badges and layout adjustments (e.g., variant image controls). (`ProductManagementComponent.css`)
-   [ ] 🔥 **Test Product Management Lifecycle (In Progress):** Conduct thorough manual and automated testing for the complete product lifecycle (add, edit, delete).
    *   **Scope:**
        *   **Adding:** Test creating products as Drafts (`availFrom` = null), Published (`availFrom` <= now), and Scheduled (`availFrom` > now). Include adding initial variants and uploading variant-specific images (via URL).
        *   **Editing:** Test modifying product details (name, description, category), availability dates (`availFrom`, `availTo`), adding/editing/deleting variants (including price, stock, type, size, color), and updating variant images (via URL). Test changing status (Draft -> Published, Published -> Draft, etc.).
        *   **Deleting:** Test deleting entire product listings and verify cascading deletes of associated items/images. Consider impact on existing orders.
        *   **Verification:** Confirm correct data persistence in the database (`Listing`, `Items`, `ItemImages` tables). Verify that Draft/Scheduled products are correctly filtered out in customer-facing views. Check edge cases (last variant deletion, invalid inputs, order linkage).
    *   **Testing Plan:**
        *   [X] **Analyze Existing Coverage:** Review existing tests (`ProductManagementComponent.spec.ts`, `ItemControllerTests.cs`). Identified minimal coverage.
        *   [X] **Define Manual Test Cases:** Create detailed manual scenarios covering the lifecycle and edge cases (See AI Chat/Planning Doc).
        *   [ ] **Implement Unit Tests:**
            *   Create `item.service.spec.ts` and test service methods (API calls, data mapping).
            *   Expand `product-management.component.spec.ts` to test form logic, validation, status calculation, variant management, and service interactions (using mocks).
        *   [ ] **Implement Integration Tests:**
            *   Expand `ItemControllerTests.cs` to cover CRUD operations, status logic based on `availFrom`, variant add/edit/delete, and invalid data handling. Test response codes and database state. Test deletion prevention if linked to orders.
            *   Create `ImageControllerTests.cs` (or add to `ItemControllerTests`) to test image URL association with variants during create/update.
        *   [ ] **Implement E2E Tests:** (Requires framework setup - e.g., Cypress/Playwright)
            *   Automate key user flows: Add product (with variants/images), Edit product (variant price/status), Delete product. Verify UI elements, data persistence, and customer view updates.
        *   [ ] **Execute & Verify:** Run all manual and automated tests. Ensure all pass and acceptance criteria are met.
    *   **Key Files:** `WebClient/src/app/components/store-owner-layout/product-management/product-management.component.ts`, `WebClient/src/app/services/item.service.ts`, `Server/Controllers/ItemController.cs`, `Server/Controllers/ImageController.cs`, `Server/Models/Listing.cs`, `Server/Models/Item.cs`, `Server/Models/ItemImage.cs`, `Server/Data/AppDbContext.cs`. Test files: `*.spec.ts`, `*Tests.cs`.
    *   **Acceptance Criteria:**
        *   Comprehensive manual test cases executed and passed.
        *   Detailed automated test plan implemented (Unit, Integration, E2E).
-   [ ] ⚠️ **Verify Customer Product View Filtering:** Ensure customer-facing views (store page, category pages) correctly filter out draft (`availFrom IS NULL`) and future-scheduled (`availFrom > GETDATE()`) products based on backend logic. (Requires checking relevant frontend components and potentially backend query adjustments).
-   [x] 🔥 **Refactor Store Preview Component:** Modify `StorePreviewComponent` to dynamically render Angular components based on its `theme`, `selectedComponents`, and `storeData` inputs, instead of using a static iframe (`assets/preview.html`) and `postMessage`.
    -   **Description:** The current preview uses a static HTML file and relies on `postMessage` to update content. This should be replaced with direct Angular rendering for a more integrated and accurate preview.
    -   **Steps:**
        1.  Remove the `iframe` element and related properties/logic (`previewUrl`, `frameLoaded`, `showFallback`, `ngAfterViewInit`, `onFrameLoad`, `onFrameError`) from `StorePreviewComponent.ts` and `.html`.
        2.  Update the `StorePreviewComponent.html` template to include placeholders for actual store components (e.g., `<app-store-header>`, `<app-hero-banner>`, `<app-featured-products>`, etc. - *Note: These components might need creation/adaptation later*).
        3.  Use `*ngIf` directives on these placeholder components to conditionally render them based on the `selectedComponents` input array.
        4.  Pass the `theme` and `storeData` inputs down to these child components as needed for styling and content.
        5.  Apply dynamic styles to the main preview container or pass theme data down, based on the `theme` input (e.g., using `[ngStyle]` or CSS variables).
        6.  Remove the `sendUpdateToPreview` method and its calls from parent components (`StoreEditorComponent.ts`, `ThemesComponent.ts`) as Angular's change detection will now handle updates automatically when inputs change.
    -   **Files:** `StorePreviewComponent.ts`, `StorePreviewComponent.html`, `StorePreviewComponent.css`, `StoreEditorComponent.ts`, `ThemesComponent.ts`
    -   **Depends on:** Existence and functionality of individual store section components (Header, Hero, etc.). Task focuses on the preview structure, not creating those child components.

### Shopping Cart & Checkout
-   [x] 🔥 **Integrate Cart with Checkout:** Modify `CheckoutComponent` to use the actual cart subtotal from `ShoppingService` instead of a hardcoded amount when calling `PaymentService.createCheckoutSession`. Also, ensure a descriptive product name (using the store name) is passed. Add checks for empty cart/invalid subtotal. (See `CheckoutComponent.ts`, `ShoppingService.ts`, `PaymentService.ts`)
-   [ ] ⚠️ **Implement Cart Quantity Updates:** Allow users to change item quantities directly in the cart UI. (`ShoppingCartComponent`, `ShoppingCartController`)
-   [ ] ⚠️ **Persist Cart for Logged-in Users:** Ensure `ShoppingCartController` correctly saves/retrieves cart state to/from the database (`ShoppingCarts` table). Test persistence across sessions. (`ShoppingService`, `ShoppingCartController`)
-   [ ] 🧊 **Implement Guest Checkout Flow:** Design and implement the process for users to purchase without creating an account. (`REQUIREMENTS.md`)

### Payments (Stripe Integration)
-   [x] 🔥 **Implement Order Creation Logic:** Create an order record in the database *before* creating the Stripe Checkout Session, including necessary details and a 'Pending' status. Pass the internal order ID in Stripe metadata. (`PaymentController`)
-   [x] 🔥 **Implement Order Fulfillment Logic:** In the Stripe webhook handler (`checkout.session.completed`), use the session/metadata to find the internal order, update its status to 'Paid'/'Processing', decrease stock, and trigger confirmation emails/digital delivery. (`PaymentController`)
-   [x] ⚠️ **Refine Payment Method Management:** Ensure the flow for adding, viewing, deleting, and setting default payment methods works seamlessly end-to-end. (`UserPaymentController`, `ProfileComponent` - Store Owner)
-   [x] ⚠️ **Handle Payment Failures:** Implement robust handling for failed payments both in Stripe Checkout redirects and webhook events. Provide clear user feedback. (`PaymentController`, `CancelComponent`)
-   [x] 🔥 **Update PaymentController to Accept Item List for Stripe Checkout:**
    -   **Description:** Modify `PaymentController.CreateCheckoutSession` and the `CheckoutSessionRequest` model to accept a list of items (`List<CheckoutItem>` with Id, Name, Price, Quantity) instead of a single amount/product name. The controller logic needs to iterate through the items and create corresponding `SessionLineItemOptions` for the Stripe Checkout Session, calculating the `UnitAmount` in cents.
    -   **Files:** `Server/Controllers/PaymentController.cs`
    -   **Depends On:** N/A (Backend change only)
    -   **Context:** Prepares the backend to receive detailed cart information for more accurate Stripe Checkout sessions and order creation. Frontend changes to send this data will follow.
-   [x] 🔥 **Fix Checkout Payload Mismatch:**
    -   **Description:** `CheckoutComponent` sends `subtotal`/`productName`/`storeId` to `PaymentService.createCheckoutSession`, but the service signature and backend (`PaymentController`) expect `List<CheckoutItem>` and `StoreUrl`.
    -   **Impact:** Checkout fails due to incorrect payload structure. Backend returns BadRequest.
    -   **Action:** Refactor `CheckoutComponent` to get detailed cart items (from `ShoppingService`) and `storeUrl`. Format payload as `List<CheckoutItem>` and `StoreUrl`. Update `PaymentService.createCheckoutSession` signature accordingly.
    -   **Files:** `CheckoutComponent.ts`, `PaymentService.ts`, `PaymentController.cs`, `ShoppingService.ts` (verify interface)
-   [ ] 🔥 **Implement Order Fulfillment in Webhook**
    **Task:** 🔥 Implement Stripe Webhook Endpoint and Order Fulfillment
    **Description:** The backend currently **lacks a webhook endpoint** to receive `checkout.session.completed` events from Stripe. This prevents order fulfillment steps (updating status to 'Paid', decreasing stock, sending confirmation emails) from running.
    **Impact:** Orders remain 'Pending', inventory is inaccurate, and customers don't receive confirmation emails, violating requirements FR4.5.3, FR4.8.1.
    **Action:**
        1.  Create a public `[HttpPost("webhook")]` endpoint (e.g., in `WebhookController.cs` or `PaymentController.cs`).
        2.  Implement Stripe webhook signature verification.
        3.  Parse the incoming `Event` object, specifically looking for `checkout.session.completed`.
        4.  Retrieve the `Session` object and extract the `internalOrderId` from metadata.
        5.  Find the corresponding `Order` in the database.
        6.  Update the `Order.Status` to 'Paid' or 'Processing'.
        7.  Implement logic to decrease stock quantity for each `OrderItem` in the order.
        8.  Integrate with the (currently commented out/incomplete) `IEmailService` to send a confirmation email.
    **Files:** `PaymentController.cs` or new `WebhookController.cs`, `Order.cs`, `OrderItem.cs`, `Item.cs` (or stock table), `IEmailService.cs` (needs completion).
    **Depends on:** Completed Email Service Implementation.
-   [x] ⚠️ **Complete Payment Failure Handling (Webhook):**
    -   **Description:** The backend **lacks a webhook endpoint** to receive failure events (e.g., `payment_intent.payment_failed`, `checkout.session.async_payment_failed`) from Stripe. While a `HandleFailedPayment` helper exists in `PaymentController`, it is never called. Robust order linkage for PaymentIntent-level failures might need verification.
    -   **Impact:** Payment failures occurring asynchronously or related to PaymentIntents might not update the internal order status correctly, leaving orders 'Pending' or without clear failure tracking.
    -   **Action:**
        1.  Create/use the same public `[HttpPost("webhook")]` endpoint as fulfillment.
        2.  Implement/reuse Stripe webhook signature verification.
        3.  Parse the incoming `Event` object, looking for relevant failure types (`payment_intent.payment_failed`, `checkout.session.async_payment_failed`, etc.).
        4.  Extract necessary information (Session, PaymentIntent, metadata).
        5.  Retrieve `internalOrderId` from metadata if available.
        6.  Call the existing `HandleFailedPayment` helper in `PaymentController` with appropriate details (ID, metadata, failure reason).
        7.  Verify/refine `HandleFailedPayment` logic to robustly link failures (especially `PaymentIntent` ones) to the internal `Order` and update status to 'Failed'.
    -   **Files:** `PaymentController.cs` or new `WebhookController.cs`.
-   [x] ⚠️ **Verify Frontend Cart Data Availability:**
    -   **Description:** Need to confirm `ShoppingService` can provide the detailed cart item list (`List<{ id, name, price, quantity }>`) required for the corrected `createCheckoutSession` payload.
    -   **Action:** Verification complete. `ShoppingService` correctly exposes the necessary data structure via `CartSubject`, and `CheckoutComponent` consumes it correctly.
    -   **Files:** `ShoppingService.ts`, `CheckoutComponent.ts`

### Reviews & Ratings
-   [ ] ⚠️ **Implement Review Submission:** Create backend endpoint and frontend UI for authenticated users to submit ratings and comments for products they've purchased. (`ReviewsController`, `ItemPageComponent` or similar)
-   [ ] 🧊 **Implement Review Moderation:** Design and implement features for store owners to manage/moderate reviews. (`REQUIREMENTS.md FR4.6.3`)

### Analytics
-   [ ] ⚠️ **Implement Backend Analytics Tracking:** Add logic to track views, sales, etc., and store/aggregate this data. (`REQUIREMENTS.md FR4.7.1`)
-   [ ] ⚠️ **Connect Analytics Frontend:** Fetch and display actual analytics data in the `AnalyticsComponent` instead of placeholders. (`AnalyticsComponent`, `AnalyticsService`)

## ⚠️ Technical Debt & Refactoring

-   [X] ⚠️ **Review `ItemsController.cs`:** Removed the old commented-out `ItemsController.cs` as it was replaced by the updated `ItemController.cs`.
-   [ ] 🧊 **Refactor Large Components:** Review components for potential breakdown into smaller, reusable parts (check against `.cursorrules` file size limit).
-   [ ] 🧊 **Consolidate API Calls:** Review frontend services for potential consolidation or optimization of HTTP requests.
-   [ ] ⚠️ **Error Handling:** Systematically review error handling in both frontend and backend. Ensure consistent logging and user-friendly feedback.
-   [ ] 🧊 **Code Style Consistency:** Run linters/formatters (ESLint, Prettier for frontend; .NET formatting tools for backend) across the codebase.
-   [ ] 🧊 **Review Redundant Order Logic:** Investigate `placeOrder` and `createOrder` methods in `ShoppingService.ts` (lines ~222-257). Determine if this non-Stripe order flow is necessary or if it should be removed to avoid confusion with the primary Stripe payment process. (`ShoppingService.ts`)
-   [ ] 🧊 **Centralize Stripe Configuration:** Move Stripe API key initialization (`StripeConfiguration.ApiKey = ...`) from `UserPaymentController.cs` constructor to a central location during application startup (e.g., `Program.cs`). (`UserPaymentController.cs`, `Program.cs`)
-   [x] 🧊 **Style Audit: Refactor Dashboard Button Styles:** Replace custom/redefined button styles (`.button`, `.primary-button`, `.secondary-button`, `.edit-button`, `.add-button`, `.save-btn`) with the global `.standard-button` class and modifiers. (`store-owner-dashboard.component.css`, `profile.component.css`, `settings.component.css`, `product-management.component.css`)
-   [ ] 🧊 **Style Audit: Refactor Dashboard Table Styles:** Ensure consistency with global `.standard-table` styles, particularly background and border styles. (`product-management.component.css`, `profile.component.css`)
-   [ ] 🧊 **Style Audit: Refactor Dashboard Form Styles:** Harmonize form element styles, removing non-standard background colors and redundant definitions. (`product-management.component.css`, `settings.component.css`)
-   [ ] 🧊 **Style Audit: Replace Hardcoded Values with CSS Variables:** Replace hardcoded colors, shadows, border-radii, and spacing values with appropriate global CSS variables defined in `styles.css`. (Affects multiple dashboard component CSS files)
-   [ ] 🧊 **Style Audit: Remove Component-Level `:root` Variables:** Remove the `:root` definition from `profile.component.css` and use global variables instead. (`profile.component.css`)
-   [ ] 🧊 **Style Audit: General Style Consistency Pass:** Perform a general pass over dashboard components to ensure consistent use of global styles and patterns defined in `README-STYLES.md`. (Affects multiple dashboard component CSS files)

## ✅ Testing

-   [ ] 🔥 **Increase Unit Test Coverage:** Add more unit tests for services, controllers, and components, focusing on critical logic (auth, payments, cart, **products**).
-   [ ] ⚠️ **Implement Integration Tests:** Add integration tests for API endpoints, especially those involving database interactions or external services (Stripe - potentially mocked, **Images**).
-   [ ] ⚠️ **Set up End-to-End (E2E) Tests:** Implement E2E tests for key user flows (registration, login, adding to cart, checkout, **product management**).
-   [ ] 🔥 **Fix Existing Test Issues:** Address commented-out tests or failing tests in `Server/Tests/`. Ensure tests run correctly in the pipeline.

## 📚 Documentation

-   [ ] ⚠️ **Review & Update Core Docs:** Ensure `README.md`, `REQUIREMENTS.md`, `ARCHITECTURE.md`, `DEVELOPMENT_GUIDELINES.md` are accurate and up-to-date with the current state.
-   [ ] 🧊 **Generate/Update API Documentation:** Ensure Swagger/OpenAPI documentation is complete and accurate for all backend endpoints.
-   [ ] 🧊 **Document Complex Code:** Add JSDoc/XML comments for complex functions, classes, or public APIs as needed.
-   [ ] ⚠️ **Create Privacy Policy:** Draft and add a privacy policy document outlining data usage. (`REQUIREMENTS.md NF5.7`)

## 🚀 Deployment & Infrastructure

-   [ ] ⚠️ **Refine Deployment Scripts/Process:** Improve upon the steps in `DEPLOYMENT.md`. Consider automating steps.
-   [ ] ⚠️ **Implement CI/CD Pipeline:** Set up a pipeline (e.g., GitHub Actions) for automated builds, tests, and deployments to Staging/Production.
-   [ ] ⚠️ **Configure Production Environment:** Set up secure configuration management (environment variables, secrets manager) for production secrets (DB connection string, API keys, JWT secret).
-   [ ] ⚠️ **Set up Monitoring & Logging:** Implement robust logging and monitoring solutions for production (e.g., Application Insights, CloudWatch, Sentry).

## ✨ UI/UX Improvements

-   [ ] ⚠️ **Implement Loading States:** Ensure appropriate loading indicators (`LoadingOneComponent` or similar) are used during data fetching or processing across the application (Review Product Management component loading states).
-   [ ] 🧊 **Refine UI based on Figma:** Conduct a review against the Figma designs and implement necessary adjustments for visual consistency and usability.
-   [ ] 🧊 **Improve Mobile Responsiveness:** Test thoroughly on various mobile devices and refine styles where needed.
-   [x] ⚠️ **Standardize Dashboard Component Styles:**
    -   **Description:** Refactor the CSS/SCSS for components within the `StoreOwnerDashboardComponent` layout (`Overview`, `Profile`, `Settings`, `ProductManagement`, `CategoryList`, `Orders`, `Themes`, `StoreEditor`, `Promotions`, `Analytics`, `SideNav`) to ensure they consistently use the global CSS variables and standard classes defined in `styles.css` and documented in `README-STYLES.md`. The goal is to make these components visually match the style established by the `LoginComponent` and `RegisterComponent` (which should also be using the global styles). Address inconsistencies in colors, fonts, spacing, button styles, table layouts, card layouts, form elements, etc.
    -   **Files:**
        -   `WebClient/src/styles.css` (Reference - Source of Truth)
        -   `WebClient/src/README-STYLES.md` (Reference - Documentation)
        -   `WebClient/src/app/components/account/login/login.component.css` (Reference - Visual Target)
        -   `WebClient/src/app/components/account/register/register.component.css` (Reference - Visual Target)
        -   `WebClient/src/app/components/store-owner-layout/store-owner-dashboard/store-owner-dashboard.component.css`
        -   `WebClient/src/app/components/store-owner-layout/overview/overview.component.css`
        -   `WebClient/src/app/components/store-owner-layout/profile/profile.component.css`
        -   `WebClient/src/app/components/store-owner-layout/settings/settings.component.css`
    - [ ] ⚠️ **Style Audit based on README-STYLES.md**
    - **Goal:** Perform a comprehensive style audit of the frontend codebase (`WebClient/src/`) against the guidelines defined in `WebClient/src/README-STYLES.md`.
    - **Context:** The `README-STYLES.md` file defines the core theme (CSS variables), global styles, and component styling patterns (like buttons, forms, cards) intended for use across the application, particularly demonstrated in the Landing Page, Login, and Register components.
    - **Acceptance Criteria:**
        - All relevant frontend styling files (`.css`, `.scss`) within `WebClient/src/` are reviewed.
        - A list of deviations from `README-STYLES.md` is generated, including:
            - File path and line number of the deviation.
            - Description of the deviation (e.g., "Hardcoded color `#FFFFFF` used instead of `var(--color-text-on-primary)`").
            - Reference to the specific variable or rule in `README-STYLES.md` that should have been used.
            - A suggested correction based on the guidelines.
        - Audit focuses on:
            - Consistent use of defined CSS variables (colors, fonts, spacing, radii, shadows).
            - Adherence to defined spacing units/patterns.
            - Correct usage of the primary font (`--main-font-fam`).
            - Consistent application of standard button styles (`.standard-button`) and component-specific styles where appropriate (e.g., `#login-btn`).
            - Consistent application of form element styles (inputs, labels, error messages).
            - Consistent application of card styles (where applicable).
            - Identification of styles that deviate significantly or use hardcoded values where variables exist.
            - Identification of styles used in components *not* covered by variables/classes in `README-STYLES.md` (flag for potential addition to the guide).
    - **Files:**
        - **Input:** `WebClient/src/README-STYLES.md`
        - **Target Scope:** `WebClient/src/**/*.css`, `WebClient/src/**/*.scss` (Primary focus), `WebClient/src/**/*.html` (Secondary check for class usage consistency)
    - **Notes:** Focus purely on style adherence as defined in the guide. Do not suggest functional changes or major refactoring beyond style correction.