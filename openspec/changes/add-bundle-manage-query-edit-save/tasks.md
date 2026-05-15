## 1. Shared contracts and data mapping

- [x] 1.1 Audit the bundle table, tube table, and order table columns used by BundleManageView, then define shared bundle, tube, query, duplicate-check, and save payload types in packages/shared.
- [x] 1.2 Add explicit mapping rules for persisted bundle records and contract records into the frontend draft model so hidden fields are preserved across query, create, edit, and save flows.
- [x] 1.3 Update frontend and backend imports to consume the new shared contracts instead of local ad hoc shapes.

## 2. Backend bundle workflow APIs

- [x] 2.1 Add a dedicated backend API module for bundle workflows and register routes for querying bundle rows by date window or bundle number.
- [x] 2.2 Implement the bundle selection detail route that returns the full bundle record together with all matching tube rows for a contract number, project number, and bundle number.
- [x] 2.3 Implement the contract-to-bundle draft bootstrap route that loads order data, copies inherited fields, and leaves required draft-only fields empty.
- [x] 2.4 Implement the duplicate bundle number validation route scoped to contract number and project number, including exclusion of the current persisted record when editing.
- [x] 2.5 Implement the transactional save route that validates the payload, rechecks uniqueness, deletes existing tube and bundle rows for the target key, inserts the new bundle row and tube rows, and returns a clear success or failure result.

## 3. Frontend API integration and page state

- [x] 3.1 Add a frontend bundle API module with thin wrappers for bundle query, detail loading, draft bootstrap, duplicate checks, and transactional save, then export it from the frontend API index.
- [x] 3.2 Refactor BundleManageView state into separate query inputs, bundle result rows, selected row state, editable bundle draft, and editable tube draft collections.
- [x] 3.3 Wire the query action so it chooses the correct backend query mode, default-selects the first result, loads detail plus tube data, and clears the detail panels with a user-facing message when no records are found.
- [x] 3.4 Wire the new-draft action so it loads contract data, creates a full bundle draft with required empty fields, preserves hidden contract-derived fields, and focuses the bundle number input.

## 4. Frontend editing, recalculation, and save UX

- [x] 4.1 Enforce bundle form editability rules so only the allowed fields are editable, while the remaining fields stay read-only and the shift selector uses the required code-to-label mapping.
- [x] 4.2 Implement local tube row add, delete, selection, and cell editing behavior without persisting changes before save.
- [x] 4.3 Add a centralized recalculation helper that recomputes shortest length, longest length, count, last flow number, and all metric and imperial totals from the current tube draft and contract weight-per-meter value.
- [x] 4.4 Trigger duplicate bundle number validation when the bundle number changes and keep duplicate values in an invalid state until the user corrects them.
- [x] 4.5 Implement save-time frontend validation, assemble the full save payload including hidden fields, submit the transactional save request, and show success or failure feedback.

## 5. Verification and completion

- [x] 5.1 Run targeted validation for the changed code paths, including repository typecheck and the relevant frontend or backend lint scope if available.
- [x] 5.2 Manually verify the core success flows: query by date window, query by bundle number, select a bundle row, create a new draft from contract data, edit tube rows, and save successfully.
- [x] 5.3 Manually verify failure and edge flows: no query results, duplicate bundle number rejection, invalid save payload rejection, and transactional rollback when backend persistence fails.
