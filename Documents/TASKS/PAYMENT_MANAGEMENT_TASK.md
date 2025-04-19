**Goal:** Review and refine the entire workflow for adding, viewing, deleting, and setting default payment methods using Stripe. Ensure seamless integration between the frontend (`ProfileComponent`, `PaymentService`) and backend (`UserPaymentController`).

**Acceptance Criteria:**
1.  Users can successfully add a new payment method via Stripe Elements, and it appears in their list.
2.  Saved payment methods (Card Type, Last 4, Expiry, Default Status) are correctly displayed on the profile page.
3.  Users can successfully delete a saved payment method, and it's removed from the list and Stripe.
4.  Users can successfully set a payment method as default, and the change is reflected in the UI and Stripe.
5.  `StripeCustomerId` is correctly managed for users (created if needed, stored in DB).
6.  Backend endpoints in `UserPaymentController` are secure (`[Authorize]`) and properly authorized (users can only manage their own methods).
7.  Error handling (Stripe API errors, validation, DB errors) is robust on both frontend and backend, providing clear user feedback.
8.  UI loading/saving states (`isSavingPaymentMethod`, etc.) are handled appropriately in `ProfileComponent`.
9.  Stripe Elements integration in `ProfileComponent` is smooth (mounting/unmounting).

**Files:**
*   `Server/Controllers/UserPaymentController.cs`
*   `WebClient/src/app/components/account/profile/profile.component.ts`
*   `WebClient/src/app/components/account/profile/profile.component.html`
*   `WebClient/src/app/services/payment.service.ts`
*   `Server/Models/User.cs`
*   `WebClient/src/app/models/user.ts`
*   `Server/Data/AppDbContext.cs`
*   `Database/TableCreation.sql`
*   Relevant `Server/Migrations/*` files