# Shopimy - Deployment Guide

This document provides instructions and considerations for deploying the Shopimy application (Frontend, Backend, and Database) to various environments (e.g., Staging, Production).

## 1. Prerequisites

Before deploying, ensure you have the following:

*   **Git:** For cloning the repository and managing versions.
*   **Node.js & npm:** Required for building the Angular frontend (version specified in `README.md`).
*   **.NET SDK:** Required for building and publishing the .NET backend (version specified in `README.md`).
*   **SQL Server:** Access to a SQL Server instance (local, self-hosted, or cloud-based like Azure SQL Database or AWS RDS).
*   **Cloud Provider Account (Optional):** If deploying to Azure, AWS, or another cloud platform.
*   **Web Server (Optional):** If self-hosting (e.g., IIS, Nginx, Apache).
*   **Stripe Account:** API keys (Secret Key, Publishable Key) and Webhook Secret.

## 2. Deployment Strategies

*   **Manual Deployment:** Suitable for initial setup or smaller environments. Involves manually building artifacts and copying them to the hosting environment.
*   **CI/CD (Continuous Integration/Continuous Deployment):** Recommended for production. Automates the build, test, and deployment process using tools like GitHub Actions, Azure DevOps, AWS CodePipeline, Jenkins, etc. (Setup for CI/CD is beyond the scope of this basic guide).

## 3. Database Deployment (SQL Server)

1.  **Provision Database:**
    *   Set up a SQL Server instance (e.g., Azure SQL Database, AWS RDS, or a dedicated server).
    *   Create a new database specifically for the Shopimy application (e.g., `Shopimy_Prod`).
2.  **Create Schema:**
    *   Connect to the newly created database using a SQL client tool (like SQL Server Management Studio, Azure Data Studio, or `sqlcmd`).
    *   Execute the `Database/TableCreation.sql` script to create all necessary tables, views, and constraints.
3.  **Seed Data (Optional):**
    *   For non-production environments (like Staging or Testing), you might want to run the `Database/SampleData.sql` script to populate the database with initial data. **Do not run sample data in Production.**
4.  **Migrations (Future):**
    *   While initial setup uses SQL scripts, future schema changes should ideally be managed using Entity Framework Core Migrations. Apply migrations using `dotnet ef database update` against the target database.
5.  **Connection String:**
    *   Obtain the connection string for the deployed database. This will be needed for the backend configuration. Ensure the database user configured has the necessary permissions (read, write, execute).
    *   **Security:** Store this connection string securely (see Configuration section).

## 4. Backend Deployment (.NET Server)

1.  **Build for Release:**
    *   Navigate to the `Server/` directory.
    *   Run the publish command:
        ```bash
        dotnet publish -c Release -o ./publish_output
        ```
    *   This creates a self-contained deployment package in the `Server/publish_output` directory.
2.  **Configure Environment:**
    *   The backend requires specific configuration settings for different environments. These are typically managed via:
        *   `appsettings.Production.json` (or `appsettings.Staging.json`, etc.) - Overrides `appsettings.json`.
        *   **Environment Variables (Recommended for Production/Staging):** Set environment variables on the hosting server/service. These override values in JSON files.
        *   **Cloud Secret Management:** Use services like Azure Key Vault or AWS Secrets Manager for sensitive data.
    *   **Key Configurations to Set:**
        *   `ConnectionStrings:DefaultConnection`: Set to the connection string of your deployed database.
        *   `Jwt:Key`: A strong, secret key for signing JWT tokens. **Generate a unique, secure key for production.**
        *   `Jwt:Issuer`: The issuer URL for JWT tokens (often your API's domain).
        *   `Stripe:SecretKey`: Your Stripe Secret API key (e.g., `sk_live_...`).
        *   `Stripe:PublishableKey`: Your Stripe Publishable API key (e.g., `pk_live_...`). Needed by `StripeController`.
        *   `Stripe:WebhookSecret`: Your Stripe Webhook Signing Secret (e.g., `whsec_...`) for verifying webhook events.
        *   `AllowedHosts`: Configure appropriately for your environment (e.g., your domain name).
    *   **Security:** **NEVER** commit sensitive keys (`Jwt:Key`, `Stripe:SecretKey`, `Stripe:WebhookSecret`, production connection strings) directly into `appsettings.json` or source control. Use environment variables, secrets managers, or `appsettings.secrets.json` (for local development only, ensured by `.gitignore`).
3.  **Deploy Artifacts:**
    *   Copy the contents of the `publish_output` directory to your hosting environment.
    *   **Hosting Options:**
        *   **Azure App Service / AWS Elastic Beanstalk:** Upload the published package. Configure environment variables through the service's portal/CLI.
        *   **IIS:** Configure an application pool and website pointing to the published directory. Set environment variables for the application pool.
        *   **Docker:** Create a `Dockerfile` based on a .NET runtime image, copy the published output, expose the necessary port (e.g., 5000/5001 or 80/443), and configure environment variables when running the container.
4.  **Configure HTTPS:** Ensure HTTPS is enforced in production environments for secure communication. This is often handled by the hosting provider or a reverse proxy (like Nginx).

## 5. Frontend Deployment (Angular WebClient)

1.  **Configure API Endpoint:**
    *   Edit `WebClient/src/environments/environment.prod.ts` (or create environment files for staging, etc.).
    *   Set the `apiUrl` property to the **publicly accessible URL of your deployed backend API**.
        ```typescript
        export const environment = {
          production: true,
          apiUrl: 'https://your-backend-api.yourdomain.com/api', // Example
        };
        ```
2.  **Build for Production:**
    *   Navigate to the `WebClient/` directory.
    *   Install dependencies: `npm install`
    *   Run the production build command:
        ```bash
        npm run build
        # or
        ng build --configuration production
        ```
    *   This creates optimized static assets (HTML, CSS, JS) in the `WebClient/dist/web-client/` directory.
3.  **Deploy Static Assets:**
    *   Copy the contents of the `WebClient/dist/web-client/browser/` directory (or similar, check build output) to your static file hosting environment.
    *   **Hosting Options:**
        *   **Cloud Storage:** Azure Blob Storage (with Static Website enabled) + Azure CDN, AWS S3 (with Static Website Hosting) + AWS CloudFront.
        *   **Web Server:** Configure Nginx, Apache, or IIS to serve the static files.
4.  **Configure SPA Routing:**
    *   Since Angular is a Single Page Application (SPA), the web server hosting the frontend assets must be configured to handle routing correctly.
    *   All requests for paths that don't match a static file should typically be redirected to serve the `index.html` file. This allows Angular Router to handle the client-side navigation.
    *   **Example (Nginx concept):**
        ```nginx
        location / {
          try_files $uri $uri/ /index.html;
        }
        ```
    *   Consult the documentation for your specific hosting provider or web server on how to configure SPA fallbacks.

## 6. Post-Deployment Steps

1.  **Testing:** Thoroughly test the deployed application:
    *   User registration and login.
    *   Store viewing and navigation.
    *   Adding items to the cart.
    *   Checkout process (use Stripe test cards in staging/test environments).
    *   Store owner dashboard functionality.
2.  **Stripe Webhook:** Ensure the Stripe webhook endpoint in your Stripe dashboard is configured correctly to point to your deployed backend's `/api/payment/webhook` endpoint and uses the correct webhook secret.
3.  **Monitoring & Logging:** Set up monitoring and logging for both the frontend and backend to track errors and performance issues (e.g., Azure Application Insights, AWS CloudWatch).
4.  **Domain & DNS:** Configure your custom domain name (if applicable) to point to your frontend hosting and backend API endpoints via DNS records.
5.  **HTTPS Certificate:** Ensure a valid SSL/TLS certificate is installed and configured for your domain.

## 7. Environment Notes

*   **Development:** Uses `appsettings.Development.json` and potentially `appsettings.secrets.json`. Frontend connects to `http://localhost:5000/api`.
*   **Staging:** Should mirror production as closely as possible. Use a separate database, staging Stripe keys, and configure backend/frontend API URLs accordingly. Ideal for final testing before production release.
*   **Production:** Uses `appsettings.Production.json` (if present) and environment variables/secrets management for configuration. Uses production database and live Stripe keys. Requires HTTPS.

---

This guide provides a general overview. Specific steps will vary depending on your chosen hosting provider and deployment tools. Always refer to the documentation of your specific services (Azure, AWS, Nginx, etc.) for detailed configuration instructions.