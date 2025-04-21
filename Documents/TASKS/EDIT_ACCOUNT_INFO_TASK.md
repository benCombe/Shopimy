// Documents/TASKS/EDIT_ACCOUNT_INFO_TASK.md
# TASK: Enable Editing of User Account Information

**Goal:** Allow users to edit their account information (First Name, Last Name, Phone, Address, Country) within the `ProfileComponent` on the Store Owner Dashboard. The Email field should remain read-only as it's the primary identifier.

**Context:**
*   The `ProfileComponent` currently fetches and displays user data successfully using `UserService`.
*   The data is retrieved from the `Users` table via the `AccountController`.
*   There is currently no functionality to update this information after it's loaded.

**Requirements / Acceptance Criteria:**

1.  **Frontend (`ProfileComponent`):**
    *   Add an "Edit" button to the Account Info section.
    *   Clicking "Edit" should:
        *   Enable editing for the First Name, Last Name, Phone, Address, and Country fields.
        *   The Email field must remain disabled/read-only.
        *   Hide the "Edit" button.
        *   Show "Save" and "Cancel" buttons.
    *   Use Angular Reactive Forms (`FormGroup`, `FormControl`) to manage the editable fields and their validation.
    *   Implement basic validation (e.g., required fields for First/Last Name, Phone).
    *   Clicking "Save" should:
        *   Validate the form.
        *   If valid, call a new method in `UserService` to update the profile.
        *   Show a loading indicator while saving.
        *   On success, disable editing, hide Save/Cancel, show Edit button, and display updated data.
        *   On error, display an error message to the user.
    *   Clicking "Cancel" should:
        *   Discard any changes made in the form.
        *   Reset the form to the original user data.
        *   Disable editing, hide Save/Cancel, show Edit button.
2.  **Service (`UserService`):**
    *   Create a new method `updateUserProfile(user: User): Observable<boolean>` (or similar).
    *   This method should send a `PUT` or `PATCH` request to the backend API endpoint (`/api/account/profile`).
    *   The request body should contain the updatable fields (First Name, Last Name, Phone, Address, Country).
    *   Upon successful update from the backend, this service should update the `activeUser$` BehaviorSubject with the latest user data.
3.  **Backend (`AccountController`):**
    *   Create a new `[HttpPut("profile")]` or `[HttpPatch("profile")]` endpoint.
    *   This endpoint **must** be protected with `[Authorize]`.
    *   It should accept a DTO containing the updatable fields (First Name, Last Name, Phone, Address, Country). **Do not accept Email or Password in the DTO.**
    *   Retrieve the authenticated user's ID from the JWT claims (`User.FindFirst(ClaimTypes.NameIdentifier)`).
    *   Fetch the corresponding `User` entity from the database using the ID.
    *   If the user is not found, return `NotFound()`.
    *   Validate the incoming DTO data (e.g., required fields).
    *   Update the fetched `User` entity's properties with the values from the DTO.
    *   Save the changes to the database using `_context.SaveChangesAsync()`.
    *   Return an appropriate success response (e.g., `Ok(true)` or `NoContent()`). Handle potential database errors.

**Files:**
*   `WebClient/src/app/components/store-owner-layout/profile/profile.component.ts`
*   `WebClient/src/app/components/store-owner-layout/profile/profile.component.html`
*   `WebClient/src/app/components/store-owner-layout/profile/profile.component.css` (If style changes needed)
*   `WebClient/src/app/services/user.service.ts`
*   `WebClient/src/app/models/user.ts`
*   `Server/Controllers/AccountController.cs`
*   `Server/Models/User.cs`
*   `Server/Data/AppDbContext.cs`
*   `Database/TableCreation.sql` (Reference)

**Priority:** 🔥 High