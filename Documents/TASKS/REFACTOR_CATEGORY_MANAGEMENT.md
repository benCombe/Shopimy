# TASK: Refactor Dashboard Category Management for Inline/Modal Editing

**Feature:** Refactor the Store Owner Dashboard's "My Store / Categories" section to allow users to add, update, and delete categories without navigating away from the main category list page.

**Current State:**
*   Categories are listed on a page likely driven by `CategoryListComponent`.
*   Adding a new category navigates the user to a separate route/page using `CategoryFormComponent` (e.g., `/dashboard/categories/new`).
*   Editing an existing category navigates the user to a separate route/page using `CategoryFormComponent` (e.g., `/dashboard/categories/edit/:id`).
*   Deleting might happen directly from the list or after navigating.

**Desired State:**
*   The user remains on the main category listing page (`CategoryListComponent`).
*   Clicking "Add Category" opens a modal or an inline form to enter new category details.
*   Clicking "Edit" next to a category opens a modal or an inline form pre-filled with that category's details.
*   Clicking "Delete" next to a category prompts for confirmation and deletes the category without navigation.
*   The category list should refresh automatically after add/update/delete operations.
*   The separate routes for `/dashboard/categories/new` and `/dashboard/categories/edit/:id` should be removed.

**Implementation Approach:**
*   Modify `CategoryListComponent` to handle the display, add/edit/delete actions, and modal/inline form presentation.
*   Adapt `CategoryFormComponent` to be reusable within a modal or inline context (using `@Input` for data and `@Output` for save/cancel events) instead of relying on route parameters.
*   Utilize `CategoryService` for backend communication (fetching, creating, updating, deleting).
*   Remove the dedicated routes for category creation and editing from `app.routes.ts`.

**Acceptance Criteria:**
1.  Users can view their list of categories within the dashboard.
2.  Users can initiate adding a new category from the list page.
3.  Users can initiate editing an existing category from the list page.
4.  Users can initiate deleting an existing category (with confirmation) from the list page.
5.  All add/edit/delete operations occur within a modal or inline form on the *same page* as the category list.
6.  The category list updates automatically after a successful add, edit, or delete operation.
7.  The routes `/dashboard/categories/new` and `/dashboard/categories/edit/:id` are removed and no longer functional.

**Priority:** Medium/High (User Experience Improvement)

**Files Likely Involved:**
*   `WebClient/src/app/components/category-list/category-list.component.ts` & `.html` & `.css`
*   `WebClient/src/app/components/category-form/category-form.component.ts` & `.html` & `.css`
*   `WebClient/src/app/services/category.service.ts`
*   `WebClient/src/app/models/category.ts`
*   `WebClient/src/app/app.routes.ts`
*   `Server/Controllers/CategoriesController.cs` (Reference)
*   `Server/Services/CategoryService.cs` (Reference)
*   `Server/Repositories/CategoryRepository.cs` (Reference)