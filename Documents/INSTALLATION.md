# Shopimy Installation Guide

This guide provides instructions for setting up the Shopimy project for local development.

## 1. Prerequisites

Before you begin, ensure you have the following software installed on your system:

*   **Git:** For cloning the repository.
*   **.NET SDK:** Version **9.0.101** (Required for the backend server).
*   **Node.js:** Version **22.13.0** (Required for the frontend client).
*   **npm:** Node Package Manager (usually comes with Node.js).
*   **Angular CLI:** Version **19.0.7**. If you don't have it or have a different version, you can install the specific version globally (use with caution) or use `npx`:
    ```bash
    # Check current version
    ng version
    # Install specific version globally (optional, consider npx)
    # npm install -g @angular/cli@19.0.7
    ```
*   **SQL Server:** A running instance of SQL Server (Express, Developer, Standard, etc.) for the application database.

_Note: Please ensure your installed versions match the ones specified above to avoid compatibility issues._

## 2. Installation Steps

### Step 2.1: Clone the Repository

Clone the project repository to your local machine using Git:

```bash
git clone <your-repository-url>
cd <repository-folder-name> # e.g., cd Shopimy
```

### Step 2.2: Backend Setup (.NET Server)

1.  **Navigate to Server Directory:**
    ```bash
    cd Server
    ```

2.  **Database Setup:**
    *   Ensure your SQL Server instance is running.
    *   Using a SQL client tool (like SQL Server Management Studio, Azure Data Studio, or `sqlcmd`), connect to your SQL Server instance.
    *   Create a new database for the project (e.g., `Shopimy_Dev`).
    *   Execute the script `Database/TableCreation.sql` against your newly created database to set up the required tables and schema.
    *   **(Optional)** Execute the script `Database/SampleData.sql` to populate the database with initial sample data for development purposes.

3.  **Configure Connection String:**
    *   Open the `Server/appsettings.json` file.
    *   Locate the `ConnectionStrings` section.
    *   Update the `DefaultConnection` value with the correct connection string for the database you created in the previous step.
    *   **Important:** For sensitive information like production connection strings or API keys (e.g., Stripe keys mentioned in `appsettings.json`), **do not** commit them directly. Use `appsettings.Development.json` or `appsettings.secrets.json` (which is ignored by Git as per `Server/.gitignore`) for local development overrides, or preferably use environment variables or a secrets manager for staging/production.

### Step 2.3: Frontend Setup (Angular WebClient)

1.  **Navigate to WebClient Directory:**
    ```bash
    # From the repository root
    cd WebClient
    # Or from the Server directory
    # cd ../WebClient
    ```

2.  **Install Dependencies:**
    Run npm install to download all the required frontend packages defined in `package.json`:
    ```bash
    npm install
    ```
    This might take a few minutes.

## 3. Running the Application

You need to run both the backend server and the frontend client simultaneously.

### Step 3.1: Run the Backend (.NET Server)

1.  Open a terminal or command prompt.
2.  Navigate to the `Server` directory.
3.  Run the application:
    ```bash
    dotnet run
    ```
4.  The backend API will typically start on `http://localhost:5000` or `https://localhost:5001` (check the console output).

### Step 3.2: Run the Frontend (Angular WebClient)

1.  Open a **separate** terminal or command prompt.
2.  Navigate to the `WebClient` directory.
3.  Start the Angular development server:
    ```bash
    npm start
    ```
    Alternatively, you can use the Angular CLI directly:
    ```bash
    ng serve
    ```
4.  The frontend application will typically be available at `http://localhost:4200`. Open this URL in your web browser. The app will automatically reload if you change any of the source files.

## 4. Development Branching

As per the project guidelines (`README.md`), please create a new branch for your development work based off the `staging` branch:

```bash
git checkout staging
git pull origin staging # Ensure your staging branch is up-to-date
git checkout -b dev-[your-name] # Replace [your-name]
```

---

You should now have the Shopimy application running locally for development. If you encounter any issues, please refer to the `README.md` or consult with the team.
```