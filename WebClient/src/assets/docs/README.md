# Shopimy

**Shop Builder for Social Media Sellers**

Shopimy is a web-based platform designed to help social media sellers and small businesses create focused, customizable online stores. It allows for selling individual items or building entire catalogs with dedicated categories and personalization features. Key features include unique visibility links, integrated payment processing via Stripe, customer reviews, an analytics dashboard, and a responsive design for all devices.

This project emphasizes ease of use and simplicity, enabling businesses to expand their reach by providing intuitive tools and seamless social media integration.

This is a culmination project for the COSC 4P02 course at Brock University, developed using Agile principles.

## ✨ Features

*   **Easy Shop Creation & Management:** Quickly set up and configure online stores.
*   **Product & Category Organization:** Manage digital and physical items within a hierarchical category structure.
*   **Unique Visibility Links:** Generate specific URLs for sharing entire shops, single categories, or individual items.
*   **Integrated Payments:** Securely process payments using Stripe.
*   **Delivery Management:** Collect shipping addresses for physical goods and provide access for digital items.
*   **Ratings & Reviews:** Allow customers to rate and review products.
*   **Analytics Dashboard:** Track shop performance, sales trends, and buyer behavior with KPIs and charts.
*   **Store Customization:** Personalize shops with logos, color schemes, and banners.
*   **Mobile-Friendly Design:** Fully responsive interface for desktops, tablets, and mobile devices.
*   **Secure Authentication:** JWT-based user registration, login, and profile management.
*   **Promotions Management:** Create and manage discount codes (percentage or fixed amount).
*   **Blog Page:** Dedicated section for blog posts and articles.
*   **Consistent Store Preview:** Store editor preview accurately reflects the live store page using shared components.

## 🛠️ Technology Stack

*   **Frontend:** Angular `19.0.7`, TypeScript, RxJS, Stripe.js (`^6.1.0`), Chart.js (`^4.4.9`)
*   **Backend:** .NET `9.0.101` (C#), ASP.NET Core, Entity Framework Core
*   **Database:** SQL Server
*   **Payments:** Stripe

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed, matching the specified versions:

*   **Git:** For version control.
*   **.NET SDK:** Version **9.0.101**
*   **Node.js:** Version **22.13.0** (includes npm)
*   **Angular CLI:** Version **19.0.7** (`npm install -g @angular/cli@19.0.7` or use `npx`)
*   **SQL Server:** A running instance (Express, Developer, etc.).

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd Shopimy
    ```

2.  **Backend Setup (.NET Server):**
    *   Navigate to the Server directory: `cd Server`
    *   **Database:**
        *   Ensure your SQL Server instance is running.
        *   Connect to SQL Server and create a new database (e.g., `Shopimy_Dev`).
        *   Execute the script `Database/TableCreation.sql` against the new database.
        *   *(Optional)* Execute `Database/SampleData.sql` for development data.
    *   **Configuration:**
        *   Open `Server/appsettings.json`.
        *   Update `ConnectionStrings:DefaultConnection` with your database connection string.
        *   **Security:** For sensitive keys (Stripe, JWT), use `appsettings.Development.json`, `appsettings.secrets.json` (ignored by git), environment variables, or a secrets manager. **Do not commit secrets to `appsettings.json`**.

3.  **Frontend Setup (Angular WebClient):**
    *   Navigate to the WebClient directory: `cd ../WebClient`
    *   Install dependencies:
        ```bash
        npm install
        ```

### Running the Application

Run both backend and frontend simultaneously in separate terminals:

1.  **Backend (.NET Server):**
    ```bash
    cd Server
    dotnet run
    ```
    *(API typically runs on http://localhost:5000 or https://localhost:5001)*

2.  **Frontend (Angular WebClient):**
    ```bash
    cd WebClient
    npm start
    ```
    *(App typically runs on http://localhost:4200)*

Open `http://localhost:4200` in your browser.

*(For more detailed setup instructions, see [Documents/INSTALLATION.md](Documents/INSTALLATION.md))*

## 🏗️ Architecture

Shopimy uses a standard Client-Server architecture:

*   **Frontend:** Angular SPA (`WebClient/`) handling UI and client-side logic. Uses shared components for store sections.
*   **Backend:** .NET RESTful API (`Server/`) handling business logic, data access, and external integrations.
*   **Database:** SQL Server for persistent storage. Includes tables for users, stores, products, orders, analytics (`StoreVisits`), promotions, etc.
*   **External Services:** Stripe for payments.

*(For a detailed breakdown, see [Documents/ARCHITECTURE.md](Documents/ARCHITECTURE.md))*

## 🤝 Contributing

Please adhere to the development guidelines:

1.  **Branching:** Create feature branches off `staging` named `dev-[your-name]`.
2.  **Workflow:** Understand task requirements (Jira/`tasks/tasks.md`), update status (`docs/status.md`), and create Pull Requests targeting `staging`.
3.  **Standards:** Follow coding standards (strict TypeScript, file size limits, DRY), formatting rules (ESLint/Prettier), and naming conventions.
4.  **Testing:** Practice TDD. Write comprehensive tests and ensure all tests pass before committing.
5.  **Security:** Prioritize security best practices (server-side validation, no hardcoded secrets).
6.  **AI Collaboration:** Follow the guidelines in `.cursorrules` for effective AI interaction. Review all AI-generated code critically.
7.  **Documentation:** Keep relevant documentation updated with your changes.

*(For full guidelines, see [Documents/DEVELOPMENT_GUIDELINES.md](Documents/DEVELOPMENT_GUIDELINES.md) and [.cursorrules](.cursorrules))*

## 📚 Documentation

A central guide to all project documentation can be found here:
[Documents/DOCUMENTATION.md](Documents/DOCUMENTATION.md)

## 🔗 Project Links

*   **Task Management:** [User Story and Task Management using Jira](https://abishop.atlassian.net/jira/software/projects/SS/summary)
*   **Design:** [Webpages designed using Figma](https://www.figma.com/design/fU1vUeeUaLm6gjVrEEEJGm/Shopimy?node-id=0-1&t=8BRonO1J8wqJrrn3-1)

## 👥 Team Members

| Name           | Role           | Student ID     | Brock Email      | GitHub Username|
|----------------|----------------|----------------|------------------|----------------|
| Ben Combe      | Scrum Master   | 5819446        | bc14lk@brocku.ca | benCombe       |
| Ashley Bishop  | Product Owner  | 6693824        | ab18yg@brocku.ca | ashley-Bishop  |
| Adam Shariff   | Dev Team       | 6768600        | as19tq@brocku.ca | adamshariff    |
| Ben DeHooge    | Dev Team       | 6567069        | bd18rc@brocku.ca | bdehooge       |
| Spencer Ing    | Dev Team       | 6756605        | si19wd@brocku.ca | Spencer-Ing    |
| Braden Lucas   | Dev Team       | 6880462        | bl19mj@brocku.ca | bl19mj         |
| Steven Putter  | Dev Team       | 6966048        | sp19cj@brocku.ca | sp19cj         |

## 📜 License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](Documents/License.txt) file for details.