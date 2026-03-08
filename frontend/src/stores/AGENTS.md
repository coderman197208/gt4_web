# Stores Guidelines

These instructions apply to Pinia stores in this folder and add to the root workspace guidance.

## Store Shape

- Use Pinia setup stores with `defineStore('name', () => { ... })`.
- Prefer `ref<T>()` for store state and keep derived values in `computed()` when needed.
- Name stores with the existing `use[Feature]Store()` convention.
- Return only the public state and actions that consumers should use.

## Responsibilities

- Keep stores focused on shared application state, state transitions, and lightweight derived state.
- Do not move transport concerns, connection lifecycle handling, or low-level API client logic into stores when that behavior belongs in `frontend/src/services/` or `frontend/src/api/`.
- Views can keep purely local UI state outside Pinia unless the data is shared across routes or components.

## Types And Data Flow

- Import shared domain types from `@gt4_web/shared` when the state mirrors backend or websocket contracts.
- When new state reflects a backend or websocket payload, update shared types first before changing the store shape.
- Accept normalized or already-parsed data in store actions when a service layer is responsible for transport parsing.

## Mutation And Logging

- Keep store actions explicit and intention-revealing, such as `updateData` or `resetData`, instead of mutating state ad hoc from consumers.
- Preserve existing debug log prefixes when extending an established store flow.
- Keep comments brief: Chinese for business-facing logic, English for structural or technical notes.
