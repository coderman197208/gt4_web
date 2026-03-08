# API Module Guidelines

These instructions apply to frontend API modules in this folder and add to the root workspace guidance.

## Module Shape

- Keep each file as a thin resource wrapper around `request.get`, `request.post`, `request.put`, `request.patch`, and `request.delete` from `client.ts`.
- Do not create a second axios instance or bypass `client.ts` unless there is a repo-wide architectural change.
- Follow the existing naming pattern: `getUsers`, `getUserById`, `createUser`, `updateUser`, `patchUser`, `deleteUser`.

## Types And Responses

- Import domain types and request parameter types from `@gt4_web/shared` whenever the backend and frontend share the contract.
- Add new shared interfaces in `packages/shared/src/types.ts` before writing the API wrapper.
- Match the actual backend response shape. Do not wrap every endpoint in `ApiResponse<T>` when the mock backend returns raw data objects.
- Keep login/auth exceptions aligned with the current `auth.ts` behavior rather than forcing all modules into one response style.

## Exports And Usage

- Re-export every new API function from `frontend/src/api/index.ts`.
- Preserve the current API entrypoint design so consumers can import from `@/api`.
- Keep comments brief and useful; prefer Chinese for business semantics and English for technical structure when needed.
