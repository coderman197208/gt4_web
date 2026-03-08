---
description: "Add a new shared type, backend Fastify route, and frontend API module using the repo's shared-types-first workflow."
name: 'Add Shared Resource'
argument-hint: 'Describe the resource, endpoint(s), fields, and any request or response rules'
agent: 'agent'
---

Implement a new API resource end-to-end using the GT4 Web shared-types-first workflow.

Use the user input after this prompt as the feature brief. The input should ideally include:

- Resource name
- Endpoint path or paths
- Data fields and TypeScript shape
- Whether the route is read-only or supports create, update, or delete
- Any special validation or response rules

If the input is missing key details, ask only for the minimum information needed to implement the resource correctly.

## Required workflow

1. Inspect existing patterns before editing.
   Use these files as the main references:
   - [packages/shared/src/types.ts](../../packages/shared/src/types.ts)
   - [backend/src/modules/api/mockRoutes.ts](../../backend/src/modules/api/mockRoutes.ts)
   - [frontend/src/api/users.ts](../../frontend/src/api/users.ts)
   - [frontend/src/api/index.ts](../../frontend/src/api/index.ts)

2. Update shared contracts first.
   Add or modify the needed interfaces and parameter types in [packages/shared/src/types.ts](../../packages/shared/src/types.ts).
   Do not define duplicate frontend-only or backend-only domain types when the type is shared by both sides.

3. Implement the backend route next.
   Add the Fastify route in [backend/src/modules/api/mockRoutes.ts](../../backend/src/modules/api/mockRoutes.ts), or in the appropriate backend API module if the codebase has already been split further.
   Follow existing route conventions:
   - use `/api/...` paths
   - use typed `Params`, `Body`, and `Reply` generics when helpful
   - use `fastify.httpErrors.*` for validation and not-found cases
   - return raw mock data objects unless the endpoint is intentionally modeled after the existing login response

4. Implement the frontend API module after the backend route exists.
   Create or update a resource module in [frontend/src/api](../../frontend/src/api) using the thin `request.get/post/put/patch/delete` wrapper pattern from [frontend/src/api/client.ts](../../frontend/src/api/client.ts).
   Import shared types from `@gt4_web/shared`.

5. Export the frontend API surface.
   Update [frontend/src/api/index.ts](../../frontend/src/api/index.ts) so the new API functions are available from the main frontend API entry point.

6. Validate only the relevant scope.
   Run the smallest useful verification commands for the touched code, such as frontend or backend typecheck, lint, or the repo-level command if that is the narrowest practical option.

## Output expectations

- Make the code changes directly instead of just proposing them.
- Keep the implementation minimal and consistent with existing patterns.
- Summarize what was added or changed.
- Mention any missing requirements you had to infer.
- Report which validation commands were run and whether they passed.

## Guardrails

- Do not skip the shared type step.
- Do not introduce a new response envelope if the existing mock API patterns do not use one.
- Do not forget to export the new frontend API functions from [frontend/src/api/index.ts](../../frontend/src/api/index.ts).
- If the request actually requires a frontend view or store change too, finish the API resource work first and then extend the frontend usage points.
