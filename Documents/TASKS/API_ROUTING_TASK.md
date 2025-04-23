// Documents/TASKS.md
- [x] 🔥 **Fix API Routing:** Review all frontend API calls in services (`WebClient/src/app/services/*.service.ts`) and ensure they correctly route to `/api/[controller]/[endpoint]`. Many are incorrectly routing to `/api/api/[controller]/[endpoint]`. Adjust the `apiUrl` in `WebClient/src/environments/environment.ts` (and `.prod.ts`) and the URL construction logic in services to achieve the correct routing.
    - **Goal:** Eliminate the double `/api/` prefix in API calls.
    - **Acceptance Criteria:**
        *   `apiUrl` in `environment.ts` and `environment.prod.ts` should point to the backend base URL (e.g., `http://localhost:5000`) *without* the `/api` suffix.
        *   All HTTP calls within frontend services (`*.service.ts`) must correctly construct the full URL as `${apiUrl}/api/[controller]/[endpoint]`.
        *   Verify API calls function correctly after the changes.
    - **Files:** `WebClient/src/environments/environment.ts`, `WebClient/src/environments/environment.prod.ts`, `WebClient/src/app/services/*.service.ts` (all files)
    - **Priority:** 🔥 High