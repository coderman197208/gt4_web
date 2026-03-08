---
description: "Extend an existing HMI view with a new panel or section while preserving the repo's fixed-screen layout, route structure, and data boundaries."
name: 'Extend HMI View'
argument-hint: 'Describe the existing view, the new panel or section to add, the data source to use, and the operator workflow'
agent: 'agent'
---

Extend an existing HMI view by adding a new panel, section, or operator-focused area.

Use the user input after this prompt as the feature brief. The input should ideally include:

- The existing view name or file
- The panel, section, or workflow to add
- Which existing API module, service, or store should provide the data
- Any layout placement expectations within the current screen
- Whether the addition is read-only, interactive, or realtime

If key details are missing, ask only for the minimum information needed to extend the screen correctly.

## Required workflow

1. Inspect the existing screen before editing.
   Review the target view and the related route or shared data sources before making changes.
   Use these files as common references when relevant:
   - [frontend/src/views](../../frontend/src/views)
   - [frontend/src/router/index.ts](../../frontend/src/router/index.ts)
   - [frontend/src/api](../../frontend/src/api)
   - [frontend/src/services](../../frontend/src/services)
   - [frontend/src/stores](../../frontend/src/stores)

2. Preserve the existing screen's layout language.
   Extend the current panel structure, spacing model, and visual density instead of redesigning the whole page.
   Keep the HMI constraints intact:
   - fixed fullscreen feel
   - no page-level scrolling unless the screen already uses a bounded internal scroll region
   - stable panel, grid, or virtual-coordinate layout
   - reuse existing UI primitives from [frontend/src/components/ui](../../frontend/src/components/ui)

3. Reuse existing data boundaries.
   Prefer existing functions from [frontend/src/api](../../frontend/src/api), composables from [frontend/src/services](../../frontend/src/services), or state from [frontend/src/stores](../../frontend/src/stores).
   Do not create a new transport layer, duplicate store state, or invent frontend-only shared contracts if the data already exists elsewhere.

4. Keep the change scoped to the requested evolution.
   Modify the existing view in place unless extracting a small helper component is clearly justified by complexity or reuse.
   Do not rewrite unrelated sections of the screen.

5. Update routing only if necessary.
   Most screen-extension tasks should not change routing. Only touch [frontend/src/router/index.ts](../../frontend/src/router/index.ts) if the request explicitly requires navigation changes.

6. Validate the relevant frontend scope.
   Run the smallest useful verification commands for the touched code, such as frontend typecheck, lint, or the repo-level command if that is the narrowest practical option.

## Output expectations

- Make the code changes directly instead of only describing them.
- Summarize which view was extended, what panel or section was added, and which existing data source was reused.
- Mention any assumptions made about placement, interactions, or operator flow.
- Report which validation commands were run and whether they passed.

## Guardrails

- Do not convert the screen into a generic scrolling dashboard.
- Do not introduce a new backend route or shared type if the request says to use existing APIs or services.
- Do not duplicate data-fetching or websocket logic that already belongs in [frontend/src/api](../../frontend/src/api), [frontend/src/services](../../frontend/src/services), or [frontend/src/stores](../../frontend/src/stores).
- Do not perform broad visual refactors outside the requested panel or section.
