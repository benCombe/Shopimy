# Shopimy - Software Requirements Document (SRD)

**Version:** 1.1 (Updated based on project structure review)

---

## 1. Introduction

This document outlines the software requirements for the Shopimy platform, a web application designed to enable social media users and small businesses to create focused, customizable online shops. It details the core features required for user management, shop creation, product listing, payment processing, customer interaction, analytics, and overall system behavior.

## 2. System Overview

The application follows a client-server architecture:
*   **Frontend:** An Angular Single Page Application (SPA) (`WebClient`) providing the user interface.
*   **Backend:** A .NET RESTful API (`Server`) handling business logic, data persistence, and external service integration.
*   **Database:** SQL Server storing application data.
*   **External Services:** Primarily Stripe for payment processing.

---

## 3. User Roles

*   **Shopper/Customer:** Browses stores, views products, adds items to the cart, makes purchases, leaves reviews. Can create an account or checkout as a guest (future).
*   **Store Owner/Seller:** Registers, creates and manages their store(s), lists products, manages orders, views analytics, customizes store appearance.
*   **(Future) Admin:** System administrators for platform management (scope not defined in this version).

---

## 4. Functional Requirements

### 4.1 User Account Management

*   **FR4.1.1 Registration:** Users shall be able to register for an account by providing necessary details (First Name, Last Name, Email, Phone, Address, Country, DOB, Password). (`AccountController`, `RegistrationDetails`)
*   **FR4.1.2 Login/Logout:** Registered users shall be able to log in securely using email and password. Users shall be able to log out, invalidating their session. (`AccountController`, `LoginDetails`, `ActiveUsers`)
*   **FR4.1.3 Authentication:** The system shall use JWT (JSON Web Tokens) for authenticating API requests after login. (`Program.cs`, `AccountController`)
*   **FR4.1.4 Password Security:** Passwords shall be securely hashed (using BCrypt) before storage. (`AccountController`)
*   **FR4.1.5 Email Verification:** New user accounts shall require email verification before full activation (User.Verified flag). The system must send a verification email. (`EMAIL_MANAGEMENT.md`, `User` model)
*   **FR4.1.6 Password Reset:** Users shall be able to request a password reset via email (mechanism TBD). (`EMAIL_MANAGEMENT.md`)
*   **FR4.1.7 Profile Management:** Logged-in users shall be able to view and update their profile information (excluding password directly). (`AccountController`, `ProfileComponent` - Store Owner)
*   **FR4.1.8 Newsletter Subscription:** Users shall be able to opt-in/out of newsletters during registration or via profile settings (`User.Subscribed`).

### 4.2 Shop Management (Seller Features)

*   **FR4.2.1 Shop Creation:** Sellers shall be able to create one or more online shops, each with a unique name and URL. (`Stores` table)
*   **FR4.2.2 Product & Category Management:**
    *   Sellers shall be able to create, update, and delete product categories, including hierarchical (parent-child) relationships. (`CategoriesController`, `Categories` table)
    *   Sellers shall be able to create, update, and delete product listings (`Listing`) and item variants (`Items`) including details like name, description, price, sale price, quantity, type, size, color, availability dates. (`ItemController`, `ItemsController`, `Listing`, `Items` tables)
    *   Support for both physical and digital items (implied by delivery requirements).
    *   Ability to associate items with categories.
    *   Ability to upload and manage item images (`ItemImages` table).
*   **FR4.2.3 Store Customization:**
    *   Sellers shall be able to customize the visual appearance of their store, including:
        *   Color schemes (Theme Colors 1, 2, 3, Font Color). (`StoreThemes` table, `ThemeSelectorComponent`)
        *   Font family. (`StoreThemes` table)
        *   Banner image/text. (`StoreBanners`, `StoreThemes` tables)
        *   Logo image/text. (`StoreLogos`, `StoreThemes` tables)
    *   A preview mechanism should allow sellers to see changes before saving (e.g., `StorePreviewComponent`).
*   **FR4.2.4 Order Management:** Sellers shall be able to view orders placed in their store (details TBD). (`OrdersComponent` placeholder)
*   **FR4.2.5 Analytics Dashboard:** Sellers shall have access to a dashboard displaying key store performance metrics. (`StoreOwnerDashboardComponent`, `AnalyticsComponent`)

### 4.3 Product Catalog & Browsing (Shopper Features)

*   **FR4.3.1 Store Viewing:** Users shall be able to view a seller's store page via its unique URL. (`StoreController`, `StorePageComponent`)
*   **FR4.3.2 Category Viewing:** Users shall be able to view products within a specific category via a unique category URL. (`CategoriesController`, `CategoryPageComponent`)
*   **FR4.3.3 Item Viewing:** Users shall be able to view the details of a single item via a unique item URL. (`ItemController`, `ItemPageComponent`, `ItemDetailComponent`)
*   **FR4.3.4 Unique Visibility Links:** The system must support distinct URLs that control visibility:
    *   **Shop Link (`/:storeUrl`):** Shows the entire shop, respecting seller's component visibility settings.
    *   **Category Link (`/:storeUrl/:category`):** Shows products within a specific category (and potentially its subcategories).
    *   **Item Link (`/:storeUrl/:category/:itemId` or `/items/:id`):** Shows details for a single item. (Exact routing may vary).

### 4.4 Shopping Cart

*   **FR4.4.1 Add to Cart:** Shoppers shall be able to add items to their shopping cart. (`ShoppingCartController`, `ShoppingService`)
*   **FR4.4.2 View Cart:** Shoppers shall be able to view the contents of their shopping cart, including items, quantities, and subtotals. (`ShoppingCartComponent`)
*   **FR4.4.3 Remove from Cart:** Shoppers shall be able to remove items from their cart. (`ShoppingCartController`, `ShoppingService`)
*   **FR4.4.4 Cart Persistence:**
    *   For logged-in users, the cart state shall be persisted in the database (`ShoppingCarts` table).
    *   For guest users, the cart state shall be persisted locally (e.g., localStorage).

### 4.5 Checkout & Payment

*   **FR4.5.1 Secure Checkout:** The system shall provide a secure checkout process. (`CheckoutComponent`)
*   **FR4.5.2 Shipping Information:** For physical goods, the system shall collect the necessary shipping address information during checkout. (`CheckoutComponent` form)
*   **FR4.5.3 Payment Processing (Stripe):**
    *   Integrate with Stripe to process payments securely via Stripe Checkout. (`PaymentController`, `PaymentService`)
    *   Handle payment success and failure notifications from Stripe via webhooks. (`PaymentController`)
*   **FR4.5.4 Payment Method Management (Logged-in Users):**
    *   Users shall be able to securely save payment methods (e.g., credit cards) via Stripe SetupIntents for future use. (`UserPaymentController`, `PaymentService`)
    *   Users shall be able to view, set a default, and delete their saved payment methods. (`UserPaymentController`, `ProfileComponent`)
*   **FR4.5.5 Digital Item Delivery:** For digital items, the system shall provide a mechanism for delivery after successful payment (e.g., download link, email). (Details TBD, related to `EMAIL_MANAGEMENT.md`)

### 4.6 Ratings and Reviews

*   **FR4.6.1 Submit Reviews:** Authenticated users who have purchased an item shall be able to submit ratings (e.g., 1-5 stars) and textual reviews for that item. (Submission endpoint TBD)
*   **FR4.6.2 Display Reviews:** Product pages shall display the average rating and individual customer reviews. (`ReviewsController`, `ProductReviewsComponent`)
*   **FR4.6.3 Moderation:** Sellers shall have the ability to moderate reviews (details TBD).

### 4.7 Analytics

*   **FR4.7.1 Data Tracking:** The system shall track key metrics like item/category views, sales data, and basic buyer behavior.
*   **FR4.7.2 Dashboard Display:** The Seller Dashboard shall display visualizations and summaries of tracked analytics data. (`AnalyticsComponent`)

### 4.8 Notifications (Email)

*   **FR4.8.1 Email Infrastructure:** The backend shall integrate an email sending service/provider. (`EMAIL_MANAGEMENT.md`)
*   **FR4.8.2 Required Emails:** The system must send emails for:
    *   Account Verification (FR4.1.5)
    *   Password Reset (FR4.1.6)
    *   Order Confirmation (Buyer)
    *   New Order Notification (Seller)
    *   Digital Item Delivery (if applicable)
*   **FR4.8.3 Optional Emails:** The system may send:
    *   Welcome Emails
    *   Shipping Notifications (Buyer)
    *   Newsletters (to subscribed users)
*   **FR4.8.4 Unsubscribe:** Marketing emails must include a functional unsubscribe link (`User.Subscribed`).

---

## 5. Non-Functional Requirements

*   **NF5.1 Performance:**
    *   Web pages should load within an acceptable timeframe (target < 3 seconds for key pages).
    *   API responses should be efficient (< 500ms for typical requests).
    *   The system should be scalable to handle increasing numbers of users, stores, and transactions.
*   **NF5.2 Security:**
    *   Adherence to secure coding practices.
    *   Protection against common web vulnerabilities (XSS, CSRF, SQL Injection).
    *   Use of HTTPS/TLS for all communication.
    *   Secure handling and storage of sensitive data (passwords, API keys, payment tokens).
    *   Regular security reviews/audits.
*   **NF5.3 Usability:**
    *   Intuitive and user-friendly interface for both Shoppers and Sellers.
    *   Clear navigation and workflow.
    *   Minimal friction during the checkout process.
*   **NF5.4 Reliability:**
    *   The system should be highly available, especially the storefront and checkout processes.
    *   Robust error handling and logging mechanisms.
*   **NF5.5 Maintainability:**
    *   Codebase should be well-documented, organized, and follow established patterns (`.cursorrules`, `DEVELOPMENT_GUIDELINES.md`).
    *   Modular design to facilitate updates and feature additions.
*   **NF5.6 Compatibility:**
    *   Frontend should be compatible with the latest versions of major web browsers (Chrome, Firefox, Safari, Edge).
    *   Responsive design ensuring usability across desktop, tablet, and mobile devices.
*   **NF5.7 Data Privacy:**
    *   Compliance with relevant data privacy regulations (e.g., GDPR, CCPA, depending on target audience).
    *   Clear communication about data usage in a privacy policy.

---

## 6. Technology Stack

*   **Frontend:** Angular 19.0.7, TypeScript
*   **Backend:** .NET 9.0.101 (C#), ASP.NET Core
*   **Database:** SQL Server
*   **Payment Gateway:** Stripe (Stripe.js on frontend, Stripe.net on backend)
*   **(Future) Hosting:** Cloud-based platform (e.g., Azure, AWS)

---

## 7. Constraints and Assumptions

*   **C7.1:** Users are assumed to have a modern web browser and internet access.
*   **C7.2:** The initial release will primarily support the English language.
*   **C7.3:** Integration is primarily focused on Stripe; other payment gateways are optional future additions.
*   **A7.1:** The hosting environment will be secure and properly configured.
*   **A7.2:** Users possess basic computer and internet literacy.

---

## 8. Appendices

*   UI/UX Wireframes/Designs: (Reference Figma Link in `README.md`)
*   Database Schema: (`Database/TableCreation.sql`)
*   API Endpoints Documentation: (To be generated or documented separately)

---

End of Document