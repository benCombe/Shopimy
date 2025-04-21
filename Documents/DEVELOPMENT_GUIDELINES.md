# Shopimy Development Guidelines

## 1. Introduction

Welcome to the Shopimy development team! This document provides essential guidelines and best practices for contributing to the project. It summarizes key points from our `.cursorrules` and `README.md`. Please familiarize yourself with these guidelines before starting work. For more detailed rules, especially regarding AI collaboration, refer to the `.cursorrules` file.

## 2. Core Philosophy

Our development approach is guided by these principles:

1.  **Simplicity:** Favor clear, simple, and maintainable solutions. Avoid over-engineering.
2.  **Iteration:** Prefer improving existing code over rewriting, unless necessary.
3.  **Focus:** Concentrate on the assigned task and avoid scope creep.
4.  **Quality:** Strive for clean, well-tested, secure, and organized code.
5.  **Collaboration:** Use these guidelines and communicate effectively with both human and AI team members.

## 3. Getting Started

### 3.1 Environment Setup

Ensure your development environment meets the following requirements:

*   **.NET:** 9.0.101
*   **Node.js:** 22.13.0
*   **Angular:** 19.0.7

If your versions differ, please upgrade before proceeding.

### 3.2 Initial Setup

1.  Clone the repository.
2.  Navigate to the `WebClient` directory: `cd WebClient`
3.  Install frontend dependencies: `npm install`
4.  Navigate to the `Server` directory: `cd ../Server`
5.  Ensure your `Server/appsettings.json` (or `appsettings.Development.json`/`appsettings.secrets.json`) has the correct database connection string. *Note: `appsettings.secrets.json` is ignored by Git.*
6.  Set up the database using the scripts in the `Database/` directory (`TableCreation.sql`, potentially `SampleData.sql`).

### 3.3 Running the Application

*   **Backend (.NET):**
    ```bash
    cd Server
    dotnet run
    ```
    The backend typically runs on `http://localhost:5000` or `https://localhost:5001`.

*   **Frontend (Angular):**
    ```bash
    cd WebClient
    npm start
    ```
    The frontend typically runs on `http://localhost:4200`.

## 4. Development Workflow

1.  **Branching:**
    *   All development work should be done on a feature branch.
    *   Create your branch off the `staging` branch.
    *   Name your branch `dev-[your-name]`.
    *   Example: `git checkout staging && git pull && git checkout -b dev-john-doe`
2.  **Task Management:**
    *   Tasks are defined in Jira (Link in `README.md`) and potentially mirrored/detailed in `tasks/tasks.md`.
    *   Understand the requirements, acceptance criteria, and dependencies before starting.
3.  **Progress Tracking:**
    *   Keep `docs/status.md` updated with your task progress (in-progress, completed, blocked).
    *   Update `tasks/tasks.md` upon task completion or if requirements change.
4.  **Pull Requests:**
    *   Push your feature branch to the remote repository.
    *   Create a Pull Request targeting the `staging` branch.
    *   Wait for approval before merging.

## 5. Architecture & Design

*   **Adherence:** Strictly follow the system architecture outlined in `Documents/ARCHITECTURE.md`. Understand module boundaries, data flow, and component responsibilities.
*   **Patterns & Tech Stack:** Utilize existing patterns and technologies documented in `README.md` and potentially `docs/technical.md`. Exhaust existing options before proposing new libraries or patterns.

## 6. Coding Standards & Style

*   **TypeScript:** Use strict typing (`noImplicitAny`, `strictNullChecks` enabled via `tsconfig.json`). Avoid using `any` where possible. Document complex logic and public APIs using JSDoc.
*   **Readability:** Write clean, well-organized, and maintainable code.
*   **File Size:** Keep files concise, ideally under **300 lines**. Refactor large files and components proactively.
*   **DRY (Don't Repeat Yourself):** Reuse existing code and functionality. Refactor to eliminate duplication.
*   **Formatting:** Ensure all code conforms to the project's ESLint/Prettier rules (run formatters/linters).
*   **Naming:** Use clear, descriptive names for files, variables, functions, and components. Avoid generic names like `temp`, `data`, `util`, or versioned names like `component-v2`.
*   **No Bazel:** Bazel is not used in this project.

## 7. Testing

*   **TDD:** Follow Test-Driven Development principles.
    *   **New Features:** Outline tests -> Write failing tests -> Implement code -> Refactor.
    *   **Bug Fixes:** Write a test reproducing the bug *before* fixing it.
*   **Coverage:** Write comprehensive unit, integration, and/or end-to-end tests for critical paths, edge cases, and core functionality.
*   **Tests Must Pass:** All tests **must** pass before committing code or considering a task complete.

## 8. Debugging & Troubleshooting

*   **Root Cause:** Focus on fixing the underlying issue, not just masking symptoms.
*   **Logs:** Always check browser console and backend server logs for errors or warnings.
*   **Targeted Logging:** Use `console.log` (or project logger) strategically to trace execution flow and variable states when needed. *Remember to check the output.*
*   **Existing Fixes:** Check the `fixes/` directory for documented solutions to similar past issues before deep-diving.
*   **Document Complex Fixes:** For non-trivial bug fixes, create a concise `.md` file in `fixes/` detailing the problem, investigation, and solution.

## 9. Security

*   **Server Authority:** Keep sensitive logic, validation, and data manipulation strictly on the server-side (.NET).
*   **Input Validation:** Always sanitize and validate user input on the **server-side**.
*   **Dependencies:** Be mindful of the security implications of adding or updating dependencies.
*   **Credentials:** **Never** hardcode secrets (API keys, passwords, connection strings) in the codebase. Use `appsettings.secrets.json` (ignored by Git) or environment variables.

## 10. Version Control (Git)

*   **Commits:** Commit frequently with clear, atomic messages describing the change.
*   **Cleanliness:** Keep your working directory clean. Ensure no unrelated or temporary files are staged or committed. Use `.gitignore` effectively.
*   **Branching:** Follow the strategy outlined in the "Development Workflow" section.

## 11. AI Collaboration

*   **Clarity:** Provide clear, specific instructions to the AI assistant. Define context, goals, and constraints.
*   **Context:** Remind the AI of relevant previous context or code snippets if needed.
*   **Review:** **Critically review all AI-generated code.** Question assumptions, verify logic, and test thoroughly. Do not blindly trust suggestions.
*   **Focus:** Guide the AI on specific, focused tasks rather than broad, architectural changes.
*   **Strengths:** Leverage AI for boilerplate, refactoring known patterns, finding syntax errors, and generating test cases, but retain human oversight for complex logic and security.
*   **Incremental:** Break down complex tasks into smaller steps for the AI.

## 12. Documentation

*   **Update:** If your code changes impact architecture, technical decisions, or task status, **update the relevant documentation** (`README.md`, `ARCHITECTURE.md`, `tasks/tasks.md`, `status.md`).
*   **Maintain:** Help keep these guidelines and other documentation up-to-date as the project evolves.

## 13. Environment Configuration

*   **.env Files:** While this project uses `appsettings.json`, the principle applies: **Never commit sensitive configuration files.** Use `.gitignore` appropriately. Use template files (like `.env.example` if applicable) for structure.
*   **Server Management:** Remember to kill related running servers before starting new ones, especially if ports conflict. Restart servers after significant backend or configuration changes.

---

*Happy Coding!*