# Shopimy - Email Management Guide

## 1. Introduction

This document outlines the strategy and requirements for managing emails sent by the Shopimy platform. Emails are crucial for user verification, notifications, and potentially marketing communications.

## 2. Purpose of Emails

The Shopimy application will need to send various types of emails, including but not limited to:

*   **Account Emails:**
    *   **Email Verification:** Sent upon registration to confirm the user's email address. (Required for `User.Verified` flag).
    *   **Password Reset:** Sent when a user requests to reset their password.
    *   **Welcome Email:** (Optional) Sent after successful registration/verification.
*   **Transactional Emails (Buyer):**
    *   **Order Confirmation:** Sent after a successful purchase, summarizing the order details. (Related to `PaymentController` webhook success).
    *   **Shipping Notification:** (For physical goods) Sent when an order has been shipped, potentially including tracking information.
    *   **Digital Item Delivery:** Sent with access/download links for purchased digital goods.
*   **Transactional Emails (Seller):**
    *   **New Order Notification:** Notifies the seller when a new order is placed in their store.
    *   **Low Stock Warning:** (Optional Future Feature) Notifies the seller when product stock levels are low.
*   **Marketing & Communication:**
    *   **Newsletters/Updates:** Sent to users who have opted-in (`User.Subscribed` flag).

## 3. Email Service Integration

The email service is **planned but not yet implemented** in the backend (`Server/`). The architecture includes commented placeholders for this functionality in `PaymentController.cs` and `AccountController.cs` with commented code in `Program.cs` for dependency injection registration.

*   **Requirement:** An email service provider or an SMTP client configuration needs to be integrated into the .NET backend.
*   **Potential Services:**
    *   **Transactional Email Services:** SendGrid, Mailgun, AWS SES, Postmark. These services offer robust delivery, tracking, and template management.
    *   **SMTP Server:** Configuring the backend to use a standard SMTP server (e.g., Gmail for development/low volume, or a dedicated corporate SMTP server).
*   **Implementation:** A dedicated `EmailService` should be created within the `Server/Services/` directory to abstract the sending logic. This service will be injected into controllers or other services that need to send emails (e.g., `AccountController` for verification, potentially an `OrderService` for confirmations).

## 4. Configuration

*   **Credentials:** API keys, SMTP usernames/passwords, and other sensitive configuration details for the chosen email service **MUST NOT** be stored directly in `appsettings.json`.
*   **Storage:** Use secure methods as per project guidelines:
    *   `appsettings.secrets.json` (for local development, ensured by `.gitignore`).
    *   Environment Variables (Recommended for Staging/Production).
    *   Cloud Secret Management (e.g., Azure Key Vault, AWS Secrets Manager).
*   **Configuration Keys (Example):** Add a section to `appsettings.json` (and its environment/secret counterparts) like:
    ```json
    "EmailSettings": {
      "Provider": "SendGrid", // or "SMTP", "Mailgun", etc.
      "ApiKey": "YOUR_API_KEY_SECRET", // Store securely!
      "SmtpHost": "smtp.example.com", // If using SMTP
      "SmtpPort": 587,             // If using SMTP
      "SmtpUser": "user@example.com", // If using SMTP
      "SmtpPass": "YOUR_SMTP_PASSWORD_SECRET", // Store securely!
      "FromName": "Shopimy",
      "FromEmail": "noreply@shopimy.com"
    }
    ```

## 5. Email Templating

*   **Requirement:** Email content (HTML and plain text versions) should be managed outside of the core C# code for easier updates and maintenance.
*   **Approach:**
    *   **Template Files:** Store email templates as separate files (e.g., `.html`, `.txt`, or using a templating engine format like `.cshtml` if using RazorEngine, or `.hbs` if using Handlebars.Net). These could reside in a dedicated `EmailTemplates` directory within the `Server` project.
    *   **Templating Engine (Optional):** Consider using a templating engine (.NET libraries like RazorEngineCore, Handlebars.Net, Scriban) to allow dynamic content insertion (e.g., user names, order details, verification links) into templates.
    *   **Basic Formatting:** For simpler emails, string interpolation or basic string replacement within the `EmailService` might suffice initially.

## 6. Development & Testing

*   **Local Development:** Avoid sending real emails during local development to prevent spamming and accidental sends. Options include:
    *   **Logging:** Configure the `EmailService` in the Development environment to log email content to the console or a file instead of sending.
    *   **Mailtrap/Similar:** Use development tools like Mailtrap.io which capture outgoing SMTP mail for inspection without actual delivery.
    *   **Mock Service:** Implement a mock `IEmailService` for unit/integration tests.
*   **Staging Environment:** Use test credentials for the chosen email service or a dedicated testing environment provided by the service (if available) to test email delivery and formatting.

## 7. Unsubscribing

*   For marketing emails (Newsletters), a clear unsubscribe link must be included in the email footer.
*   This link should trigger an action in the backend to update the `User.Subscribed` flag for the respective user.

## 8. Future Considerations

*   Email tracking (opens, clicks).
*   More sophisticated template management.
*   A/B testing for marketing emails.
*   Integration with CRM or marketing automation platforms.