## Context

BundleManageView currently renders the target HMI layout, but its query, selection, add, edit, and save actions are still placeholders backed by local reactive state only. The page already exposes the main interaction surfaces: a query bar, a bundle result list, a bundle detail form, and a tube grid. On the backend, the repository already has Prisma-backed Fastify routes for contract and parameter data, but there is no bundle-focused API yet. This change spans frontend view state, frontend API wrappers, shared request and entity types, backend route design, and transactional database writes across bundle and tube tables.

The business rules create two implementation constraints that drive the design. First, both query and save flows must preserve fields that are not visible in the UI, otherwise an edit round-trip would silently lose data. Second, the page mixes persisted data and client-side draft behavior: querying and saving are server-backed, but creating a draft bundle, editing tube rows, and recalculating derived totals are frontend-local until the user explicitly saves.

## Goals / Non-Goals

**Goals:**

- Provide a coherent end-to-end data flow for bundle query, detail loading, new draft creation, editing, validation, and save.
- Preserve the full bundle record and related tube records even when only a subset of fields is rendered on the page.
- Keep HMI interactions responsive by performing draft edits and derived-field recalculation locally in the frontend.
- Use backend transactions to replace bundle and tube records atomically for a given contract number, project number, and bundle number.
- Keep the implementation aligned with existing monorepo patterns: shared types first, thin frontend API modules, and Fastify plus Prisma database access.

**Non-Goals:**

- Redesign the BundleManageView layout or introduce a new page structure.
- Add a multi-page subscription model, background autosave, or optimistic persistence.
- Implement printing behavior changes; the existing label print entry point remains outside this change.
- Introduce a separate database migration workflow in this artifact; the design assumes the required tables already exist.

## Decisions

### 1. Use full-record draft models on the frontend instead of UI-only field subsets

The frontend will keep bundle and tube data in draft models that represent the persisted records, not just the visible inputs. Query responses and new-draft responses will include all bundle fields needed for save, including hidden fields copied from bundle or contract data. BundleManageView will bind visible fields to this richer draft object and leave hidden fields untouched unless backend-driven mapping requires a change.

Rationale: the requirement explicitly says non-displayed fields must still be queried and saved. A UI-only model would force ad hoc merge logic at save time and makes accidental field loss likely.

Alternatives considered:

- Reconstruct hidden fields only during save by merging visible form data with the last fetched payload. Rejected because it creates fragile branching between queried records and newly created drafts.
- Let the backend infer all missing fields during save. Rejected because new draft creation must preload contract-derived values before any save happens.

### 2. Split backend capabilities into focused bundle APIs rather than one overloaded endpoint

The backend will expose focused endpoints for: bundle query, bundle detail plus related tubes, contract-to-bundle draft bootstrap, duplicate bundle number validation, and transactional save. The frontend API layer will mirror these as thin request wrappers. The save endpoint will accept a single payload containing the complete bundle draft and its tube list.

Rationale: the query, draft bootstrap, duplicate check, and save flows have distinct inputs and failure modes. Focused endpoints keep validation simple, map cleanly to the UI actions, and match the existing route style used by orderDataRoutes.

Alternatives considered:

- A single generic bundle endpoint with action flags. Rejected because it obscures contract boundaries and makes typing and validation harder.
- Loading bundle details and tube rows through two separate user-triggered frontend requests after row selection. Partially accepted internally, but the route contract will still be treated as one selection flow so the page can clear and repopulate both panels consistently.

### 3. Normalize the page into three state slices: query state, selected persisted data, and editable draft state

BundleManageView will maintain separate state for query inputs, the left-side bundle result list, and the currently editable draft. Selecting a queried row replaces the current draft with a deep copy of the fetched bundle plus tubes. Clicking “新增” creates a new draft from contract data and clears all fields that the requirement marks as empty-by-default. Tube row add, delete, and cell edit operations mutate only the draft state.

Rationale: the current page mixes list rows and form fields in a single local structure. Separating result state from editable draft state prevents accidental mutation of list data, makes reset behavior deterministic when no records are found, and supports the “new draft without immediate persistence” requirement.

Alternatives considered:

- Mutate the selected row object in place. Rejected because queried list rows do not contain the full bundle payload and should remain a stable read model.
- Move the page state into Pinia. Rejected for now because the workflow is page-local and there is no cross-page consumer.

### 4. Centralize derived field computation in a frontend recalculation utility

Derived bundle values such as minimum length, maximum length, count, final flow number, metric and imperial totals, and theory weight/length will be recomputed from the draft tube list through a single recalculation helper. The helper will read `weight_per_meter` from the contract-derived bundle context and apply the required rounding rules. The recalculation runs after tube row add, delete, or edit, and also after loading a new draft if the frontend needs to reconcile missing derived values.

Rationale: these rules are explicitly frontend-local until save. Centralizing them avoids duplicate formula logic across click handlers and table cell events.

Alternatives considered:

- Ask the backend to recompute derived fields on every edit. Rejected because the requirement says add, delete, and edit are frontend-only until save.
- Compute values lazily only during save. Rejected because the middle panel must show updated derived values as the user edits tube rows.

### 5. Validate bundle number uniqueness through a dedicated backend check before save

When the user edits the bundle number of a draft, the frontend will call a lightweight duplicate-check endpoint scoped by contract number and project number. The endpoint returns whether the proposed bundle number already exists, excluding the currently loaded persisted record when editing an existing bundle. The save endpoint will repeat the same invariant defensively inside the transaction.

Rationale: the UI needs immediate feedback, but frontend-only checking is insufficient because concurrent edits can still race.

Alternatives considered:

- Detect duplicates only during save. Rejected because the requirement asks for feedback when bundle number changes.
- Validate against the currently loaded list on the client. Rejected because the list may not contain every bundle for the contract and project combination.

### 6. Implement save as delete-and-reinsert within a single database transaction

The save operation will execute in a Prisma transaction: validate payload integrity, check duplicate bundle number invariants, delete existing tube rows for the target contract/project/bundle key, delete the existing bundle row for that key, insert the new bundle row, and insert all new tube rows. The backend returns a success or failure result to the frontend without partially committed records.

Rationale: the business requirement explicitly defines replacement semantics and rollback behavior. Modeling save as a full replacement keeps frontend payload construction simple and avoids diff calculation for tube rows.

Alternatives considered:

- Per-row upsert for bundle and tube tables. Rejected because it complicates deletion semantics and is unnecessary for the stated workflow.
- Delete bundle before tubes with foreign key dependence. Rejected as the default order because tube deletion first is safer when referential constraints exist.

## Risks / Trade-offs

- [Hidden field mapping drift between contract data and bundle data] → Define explicit mapping functions for query-to-draft and contract-to-draft conversion instead of spreading assignments across the component.
- [Frontend draft state becoming inconsistent after multiple operations] → Treat selection and new-draft actions as full draft replacement boundaries and recompute derived fields after every tube mutation.
- [Duplicate bundle checks passing in UI but failing during save because of concurrent changes] → Re-run uniqueness validation inside the save transaction and return a specific conflict response.
- [Rounding and unit conversion mismatches with legacy behavior] → Isolate formulas in one utility and validate them against representative sample data from the target tables before rollout.
- [Large raw SQL statements becoming difficult to maintain] → Keep query SQL focused by operation and introduce small typed mapper functions instead of one monolithic persistence layer.

## Migration Plan

1. Add shared bundle, tube, query, duplicate-check, and save payload types so frontend and backend use the same contract.
2. Add backend route registration and Prisma-backed query/save logic for bundle workflows alongside existing API modules.
3. Add frontend API wrappers for the new endpoints.
4. Refactor BundleManageView to use explicit query state, result rows, draft bundle state, draft tube rows, and recalculation helpers.
5. Validate with targeted typecheck and manual UI flows: query by date, query by bundle number, create new draft, edit tube rows, duplicate bundle number validation, and transactional save success/failure.
6. Rollback strategy: revert the new routes and frontend integration together; no persisted schema change is required for rollback if the database tables remain unchanged.

## Open Questions

- The current UI includes a “删除” button for bundle records, but the requirement document does not define bundle deletion behavior. This change treats save as replacement only and leaves standalone deletion out of scope unless clarified.
- The date-window query uses “前一天 19:45 到当天 19:45”; the design assumes backend-side boundary calculation using local server time. If the production environment has timezone-specific rules, that boundary handling needs confirmation before implementation.
- The exact database column names for the bundle and tube tables need to be confirmed during implementation so the shared types and mapper functions preserve all hidden fields correctly.
