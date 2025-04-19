# Task: Review Payments End-to-End Journey

**Goal:** Conduct a thorough review of the entire Payments (Stripe Integration) workflow, verifying the implementation of completed tasks listed in `Documents/TASKS.md` against the actual codebase. Identify any discrepancies, potential issues, or remaining gaps, particularly concerning the two incomplete tasks.

**Context:**
-   Refer to the "Payments (Stripe Integration)" section in `Documents/TASKS.md`.
-   Consult `Documents/REQUIREMENTS.md` (FR4.5.*, FR4.8.*) for functional requirements.
-   Refer to `Documents/ARCHITECTURE.md` for component interactions and data flow.
-   Check `Documents/EMAIL_MANAGEMENT.md` for context on email integration points.

**Review Steps & Verification Points:**

1.  **Checkout Initiation & Order Creation:**
    *   **Files:** `CheckoutComponent.ts`, `ShoppingService.ts`, `PaymentService.ts`, `PaymentController.cs`, `Order.cs`, `OrderItem.cs`, `AppDbContext.cs`, `TableCreation.sql`
    *   **Verify:**
        *   `CheckoutComponent` correctly retrieves detailed cart items (`List<CheckoutItem>`) from `ShoppingService`.
        *   `CheckoutComponent` correctly retrieves the `storeUrl`.
        *   `PaymentService.createCheckoutSession` sends the correct payload (`List<CheckoutItem>`, `storeUrl`, `storeId`) to the backend.
        *   `PaymentController.CreateCheckoutSession` successfully receives the item list and store URL.
        *   An `Order` record with `Status='Pending'` and associated `OrderItems` is created in the database *before* the Stripe session is created.
        *   The internal `OrderId` is correctly included in the Stripe Session `Metadata`.
        *   The `StripeSessionId` is saved back to the `Order` record after Stripe session creation.
        *   Correct calculation of `UnitAmount` in cents for Stripe `SessionLineItemOptions`.
        *   Error handling for invalid cart data or issues during order creation.

2.  **Payment Success & Order Fulfillment (Webhook):**
    *   **Files:** `PaymentController.cs`, `Order.cs`, `OrderItem.cs`, `AppDbContext.cs`, `TableCreation.sql` (Item quantity), `EMAIL_MANAGEMENT.md` (for context)
    *   **Verify:**
        *   Webhook handler correctly identifies the `checkout.session.completed` event.
        *   Webhook signature verification is implemented.
        *   Internal `OrderId` is successfully retrieved from session metadata.
        *   The corresponding `Order` is found in the database.
        *   Order `Status` is updated correctly (e.g., to 'Paid' or 'Processing').
        *   Logic exists to decrease stock quantity for each `OrderItem` in the order (check interaction with `Items` table).
        *   Integration point exists for triggering confirmation emails (even if `EmailService` is not fully implemented, the call should be present).
        *   Handles potential errors during fulfillment (e.g., order not found, stock update fails).

3.  **Payment Failure Handling:**
    *   **Files:** `PaymentController.cs`, `CancelComponent.ts`, `Order.cs`, `AppDbContext.cs`
    *   **Verify:**
        *   Stripe Checkout redirects to the correct `CancelUrl` (including `storeUrl` parameter) on cancellation/failure during Stripe Checkout.
        *   `CancelComponent` correctly displays feedback to the user.
        *   Webhook handler processes failure events (e.g., `payment_intent.payment_failed`).
        *   The `HandleFailedPayment` helper function in `PaymentController` is implemented and attempts to link the failure back to the internal `Order`.
        *   Check if the Order `Status` is updated appropriately on payment failure (e.g., to 'Failed').

4.  **Payment Method Management:**
    *   **Files:** `ProfileComponent.ts`, `PaymentService.ts`, `UserPaymentController.cs`, `User.cs`, `AppDbContext.cs`
    *   **Verify:**
        *   User's `StripeCustomerId` is created/retrieved and stored correctly.
        *   Flow for adding a new payment method using Stripe Elements (`ProfileComponent` -> `PaymentService` -> `UserPaymentController.CreateSetupIntent` -> `UserPaymentController.SavePaymentMethod`) works.
        *   Saved payment methods (card type, last 4, expiry, default status) are correctly retrieved and displayed (`UserPaymentController.GetPaymentMethods` -> `PaymentService` -> `ProfileComponent`).
        *   Deleting a payment method works (`ProfileComponent` -> `PaymentService` -> `UserPaymentController.DeletePaymentMethod`).
        *   Setting a default payment method works (`ProfileComponent` -> `PaymentService` -> `UserPaymentController.SetDefaultPaymentMethod`).
        *   Endpoints in `UserPaymentController` are secured (`[Authorize]`) and users can only manage their own methods.
        *   Error handling (Stripe API errors, validation) is present.

5.  **Frontend Data Availability:**
    *   **Files:** `ShoppingService.ts`, `CheckoutComponent.ts`
    *   **Verify:** `ShoppingService` exposes a method or observable that provides the cart items in the required format (`List<{ id, name, price, quantity }>`) for `CheckoutComponent` to consume.

**Analysis of Incomplete Tasks:**

*   **Task:** ⚠️ **Complete Payment Failure Handling (Webhook):**
    *   Assess the current implementation of `HandleFailedPayment` in `PaymentController.cs`.
    *   Is the linking between `PaymentIntent` failure events and the internal `Order` robust? How is the order identified?
    *   What specific logic is missing or needs refinement?
    *   Is the order status correctly updated to 'Failed' on relevant failure events?
*   **Task:** ⚠️ **Verify Frontend Cart Data Availability:**
    *   Examine `ShoppingService.ts`. Does it currently provide the cart data in the necessary structure (`List<{ id, name, price, quantity }>` where `id` is the *item* ID)?
    *   If not, what changes are needed in `ShoppingService` or its data sources?

**Output:**
*   A summary confirming which parts of the completed tasks are correctly implemented.
*   A detailed list of any discrepancies, bugs, potential issues, or areas where the implementation deviates from the task descriptions or requirements.
*   A clear analysis of the two incomplete tasks, outlining their current state and the specific actions needed for completion.