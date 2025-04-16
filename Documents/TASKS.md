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
-   [ ] 🔥 **Implement Email Verification Flow:** Send verification email upon registration and check `User.Verified` status during login/access control. (`AccountController`, `UserService`, `REQUIREMENTS.md FR4.1.5`)
-   [ ] ⚠️ **Implement Password Reset Flow:** Create UI, backend logic, and email sending for password resets. (`AccountController`, `UserService`, `REQUIREMENTS.md FR4.1.6`)
-   [ ] 🧊 **Implement Social Logins:** Add Google/Facebook OAuth login functionality. (`LoginComponent`, `AccountController`)
-   [ ] ⚠️ **Refine User Profile Update:** Ensure all relevant user fields can be updated securely via the profile page and backend. (`ProfileComponent` - Store Owner, `AccountController`)

### Store & Product Management (Seller)
-   [ ] 🔥 **Implement Product Management UI:** Create forms and logic for adding, editing, and deleting products (`Listing`, `Items`) and variants, including image uploads. (`ProductManagementComponent`, `ItemController`, `ItemsController`)
-   [ ] 🔥 **Implement Category Management UI:** Create forms and logic for adding, editing (including parent), and deleting categories. (`CategoryListComponent`, `CategoryFormComponent` - needs creation/integration, `CategoriesController`)
-   [ ] ⚠️ **Implement Theme/Logo/Banner Saving:** Connect the frontend theme/logo/banner selectors to backend endpoints to persist customization changes. (`ThemesComponent`, `LogoSelectorComponent`, `StoreController` needs update endpoints)
-   [ ] ⚠️ **Implement Store Component Visibility:** Allow sellers to toggle component visibility (e.g., featured products, testimonials) and persist this configuration. Reflect this visibility on the public store page. (`StoreEditorComponent`, `StorePageComponent`, needs backend storage)
-   [ ] 🔥 **Implement Order Management View:** Create UI for sellers to view incoming orders and their details. (`OrdersComponent`, `REQUIREMENTS.md FR4.2.4`, needs backend data source)

### Shopping Cart & Checkout
-   [ ] 🔥 **Integrate Cart with Checkout:** Pass actual cart items and total amount to the `PaymentService.createCheckoutSession` call instead of placeholders. (`CheckoutComponent`, `ShoppingService`)
-   [ ] ⚠️ **Implement Cart Quantity Updates:** Allow users to change item quantities directly in the cart UI. (`ShoppingCartComponent`, `ShoppingCartController`)
-   [ ] ⚠️ **Persist Cart for Logged-in Users:** Ensure `ShoppingCartController` correctly saves/retrieves cart state to/from the database (`ShoppingCarts` table). Test persistence across sessions. (`ShoppingService`, `ShoppingCartController`)
-   [ ] 🧊 **Implement Guest Checkout Flow:** Design and implement the process for users to purchase without creating an account. (`REQUIREMENTS.md`)

### Payments (Stripe Integration)
-   [ ] 🔥 **Implement Order Creation Logic:** Create an order record in the database *before* creating the Stripe Checkout Session, including necessary details and a 'Pending' status. Pass the internal order ID in Stripe metadata. (`PaymentController`)
-   [ ] 🔥 **Implement Order Fulfillment Logic:** In the Stripe webhook handler (`checkout.session.completed`), use the session/metadata to find the internal order, update its status to 'Paid'/'Processing', decrease stock, and trigger confirmation emails/digital delivery. (`PaymentController`)
-   [ ] ⚠️ **Refine Payment Method Management:** Ensure the flow for adding, viewing, deleting, and setting default payment methods works seamlessly end-to-end. (`UserPaymentController`, `ProfileComponent` - Store Owner)
-   [ ] ⚠️ **Handle Payment Failures:** Implement robust handling for failed payments both in Stripe Checkout redirects and webhook events. Provide clear user feedback. (`PaymentController`, `CancelComponent`)

### Reviews & Ratings
-   [ ] ⚠️ **Implement Review Submission:** Create backend endpoint and frontend UI for authenticated users to submit ratings and comments for products they've purchased. (`ReviewsController`, `ItemPageComponent` or similar)
-   [ ] 🧊 **Implement Review Moderation:** Design and implement features for store owners to manage/moderate reviews. (`REQUIREMENTS.md FR4.6.3`)

### Analytics
-   [ ] ⚠️ **Implement Backend Analytics Tracking:** Add logic to track views, sales, etc., and store/aggregate this data. (`REQUIREMENTS.md FR4.7.1`)
-   [ ] ⚠️ **Connect Analytics Frontend:** Fetch and display actual analytics data in the `AnalyticsComponent` instead of placeholders. (`AnalyticsComponent`, `AnalyticsService`)

## ⚠️ Technical Debt & Refactoring

-   [ ] ⚠️ **Review `ItemsController.cs`:** Decide whether to reintegrate, replace, or remove the commented-out stock update logic. Ensure stock updates are handled correctly elsewhere if removed.
-   [ ] 🧊 **Refactor Large Components:** Review components for potential breakdown into smaller, reusable parts (check against `.cursorrules` file size limit).
-   [ ] 🧊 **Consolidate API Calls:** Review frontend services for potential consolidation or optimization of HTTP requests.
-   [ ] ⚠️ **Error Handling:** Systematically review error handling in both frontend and backend. Ensure consistent logging and user-friendly feedback.
-   [ ] 🧊 **Code Style Consistency:** Run linters/formatters (ESLint, Prettier for frontend; .NET formatting tools for backend) across the codebase.

## ✅ Testing

-   [ ] 🔥 **Increase Unit Test Coverage:** Add more unit tests for services, controllers, and components, focusing on critical logic (auth, payments, cart).
-   [ ] ⚠️ **Implement Integration Tests:** Add integration tests for API endpoints, especially those involving database interactions or external services (Stripe - potentially mocked).
-   [ ] ⚠️ **Set up End-to-End (E2E) Tests:** Implement E2E tests for key user flows (registration, login, adding to cart, checkout).
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

-   [ ] ⚠️ **Implement Loading States:** Ensure appropriate loading indicators (`LoadingOneComponent` or similar) are used during data fetching or processing across the application.
-   [ ] 🧊 **Refine UI based on Figma:** Conduct a review against the Figma designs and implement necessary adjustments for visual consistency and usability.
-   [ ] 🧊 **Improve Mobile Responsiveness:** Test thoroughly on various mobile devices and refine styles where needed.

## 🔒 Security Enhancements

-   [ ] ⚠️ **Conduct Security Review:** Perform a basic security audit, checking for common vulnerabilities (XSS, CSRF, insecure direct object references, etc.).
-   [ ] ⚠️ **Review Dependency Security:** Check dependencies for known vulnerabilities.

## 🧊 Future Features / Nice-to-Haves

-   [ ] **Admin Role:** Define and implement an administrative role for platform management.
-   [ ] **Advanced Promotions:** Implement more complex discount rules (e.g., BOGO, tiered discounts).
-   [ ] **Multiple Stores per User:** Ensure the data model and UI fully support sellers managing multiple distinct stores.
-   [ ] **Internationalization (i18n):** Add support for multiple languages.
-   **Shipping Integration:** Integrate with shipping carriers for real-time rates and label printing.
-   **Inventory Management:** More advanced stock tracking features (low stock alerts, variants).

---
*Add new tasks under the appropriate sections.*