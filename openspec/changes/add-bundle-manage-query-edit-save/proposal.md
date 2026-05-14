## Why

BundleManageView currently lacks the end-to-end behavior needed for production use: operators cannot reliably query existing bundle records, create a new bundle draft from contract data, edit bundle and tube details, or save the combined data set back to the backend. This change is needed now to turn the page from a static shell into a usable bundle maintenance workflow that matches the existing business process and database model.

## What Changes

- Add bundle query behavior that supports searching by bundle number or by the business production window derived from the selected date, then displays bundle rows, bundle details, and related tube records together.
- Add bundle creation behavior that loads contract and project data into a new editable draft while preserving required fields that are not shown on the page.
- Add bundle and tube editing behavior, including field-level editability rules, duplicate bundle number checks, tube row add/delete/edit actions, and automatic recalculation of derived bundle totals.
- Add save behavior with frontend validation and backend transactional replacement of bundle and tube records for the same contract number, project number, and bundle number.

## Capabilities

### New Capabilities

- `bundle-query-and-detail-loading`: Query bundle data by date window or bundle number, default-select the first result, populate bundle details, and load related tube records while preserving non-displayed bundle fields.
- `bundle-draft-editing`: Create a new bundle draft from contract data, enforce editable versus read-only bundle fields, validate duplicate bundle numbers, support tube row editing, and recalculate derived bundle metrics from tube data.
- `bundle-transactional-save`: Validate bundle and tube data before save, then replace persisted bundle and tube records transactionally and return success or failure to the frontend.

### Modified Capabilities

- None.

## Impact

- Affected frontend areas include BundleManageView, related API modules, and shared form-state or table-editing logic for bundle and tube records.
- Affected backend areas include new or expanded API routes, database access for bundle, tube, and contract tables, duplicate bundle number checks, and transactional save handling.
- Affected shared contracts include bundle, tube, contract, query, and save payload types in packages/shared.
- No new external dependencies are expected; the change primarily extends existing Vue, Fastify, Prisma, and shared TypeScript layers.
