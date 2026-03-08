# Services Guidelines

These instructions apply to frontend service modules in this folder and add to the root workspace guidance.

## Service Shape

- Keep services as composable-style modules with explicit public methods. Follow the existing `useWebSocket()` pattern for reusable runtime capabilities.
- Avoid scattering connection lifecycle logic across views or components when a service module should own it.
- Reuse shared contracts from `@gt4_web/shared` for payloads and event shapes.

## WebSocket Work

- Treat `websocket.ts` as the single frontend socket integration point unless a deliberate refactor introduces another service boundary.
- Preserve the singleton connection model and reactive connection state unless there is a strong reason to change it across the app.
- Use `subscribe(tags)` to update subscriptions and an empty array to clear them. Do not create parallel subscription state in components.
- Keep websocket logs prefixed with `[WebSocket]` for consistency with existing debugging output.

## Integration

- If service changes affect shared data contracts or backend events, update shared types first and then keep backend and frontend event handling aligned.
- Push store updates through existing stores such as `realtimeData` instead of embedding unrelated app state directly inside the service.
- Keep technical comments in English and business-facing notes in Chinese where comments are needed.
