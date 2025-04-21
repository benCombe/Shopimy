# Shopimy Project Documentation

Welcome to the central documentation hub for the Shopimy project. This file serves as a guide to help you navigate the various documents outlining the project's requirements, architecture, development practices, and progress.

## 📚 Core Documents

*   **[README.md](../README.md)**
    *   **Content:** High-level project overview, team members, technology stack versions (`.NET`, `Node.js`, `Angular`), initial setup instructions, running the application, project objectives, timeline, and license information.
    *   **Audience:** All team members, new contributors.
    *   **When to Read:** First point of contact for understanding the project basics and getting the development environment set up.

*   **[REQUIREMENTS.md](REQUIREMENTS.md)**
    *   **Content:** Detailed functional and non-functional requirements for the Shopimy platform, including features like shop creation, unique links, payment integration, analytics, customization, and mobile design.
    *   **Audience:** Developers, Product Owner, QA.
    *   **When to Read:** When implementing features or verifying functionality against specifications.

*   **[ARCHITECTURE.md](ARCHITECTURE.md)**
    *   **Content:** Overview of the system's architecture, detailing the frontend (Angular), backend (.NET), database (SQL Server), external service integrations (Stripe), component responsibilities, data flow examples, and conceptual deployment strategy.
    *   **Audience:** Developers, Architects.
    *   **When to Read:** To understand the overall system structure, component interactions, and where specific functionality resides.

*   **[DEVELOPMENT_GUIDELINES.md](DEVELOPMENT_GUIDELINES.md)**
    *   **Content:** Practical guidelines for day-to-day development, summarizing key rules from `.cursorrules`. Covers environment setup, workflow (branching, PRs), coding standards, testing, debugging, security, version control, and AI collaboration practices.
    *   **Audience:** All Developers (Human & AI).
    *   **When to Read:** Before starting development work and as a reference for standard practices.

*   **[.cursorrules](../.cursorrules)**
    *   **Content:** Detailed rules and guidelines specifically tailored for development within the Cursor IDE, emphasizing AI collaboration protocols, code quality standards, task execution workflow, and specific project constraints (like file size limits).
    *   **Audience:** All Developers (Human & AI), especially when using AI assistance.
    *   **When to Read:** For in-depth understanding of development rules and mandatory AI interaction patterns.

## 🔄 Project Tracking & History

*   **[CHANGELOG.md](CHANGELOG.md)**
    *   **Content:** A chronological log of notable changes, additions, and fixes made to the project, typically updated per release or significant development milestone.
    *   **Audience:** All team members.
    *   **When to Read:** To understand the evolution of the project and recent changes.

*   **[sprint_logs/](sprint_logs/)**
    *   **Content:** Directory containing logs (Excel files) detailing the progress, tasks completed, and potentially issues encountered during specific development sprints.
    *   **Audience:** Scrum Master, Product Owner, Development Team.
    *   **When to Read:** For reviewing sprint progress and history.

*   **[fixes/](../fixes/)** _(Directory)_
    *   **Content:** Contains markdown files documenting the investigation and resolution of complex or significant bugs, as mandated by `.cursorrules`.
    *   **Audience:** Developers.
    *   **When to Read:** When encountering a complex bug, check here first for similar previously solved issues. Document new complex fixes here.

## 🚀 Deployment

*   **[DEPLOYMENT.md](DEPLOYMENT.md)**
    *   **Content:** Instructions and considerations for deploying the frontend, backend, and database to different environments (Staging, Production). Covers prerequisites, configuration management (especially secrets), build steps, and hosting options.
    *   **Audience:** Developers, DevOps, Operations.
    *   **When to Read:** When preparing to deploy the application to a new environment.

---

Please keep these documents updated as the project evolves. Refer to `DEVELOPMENT_GUIDELINES.md` for instructions on maintaining documentation.