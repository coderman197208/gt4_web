---
description: 'Use when editing shared contracts in packages/shared/src. Covers file placement, barrel exports, cross-package coordination, and validation for shared DTO changes.'
name: 'Shared Package Guidelines'
applyTo: 'packages/shared/src/**'
---

# Shared Package Guidelines

- `packages/shared` is the contract source of truth for data exchanged between frontend and backend. Keep it framework-agnostic: no Vue, Fastify, Prisma, or app-local imports.
- Put new types in the file that matches the concern, then re-export them from `packages/shared/src/index.ts`.
  - `db_types.ts`: HTTP payloads, API request params, database-shaped domain models
  - `redis_types.ts`: WebSocket payloads, Redis event data, realtime tags, command payloads
  - `alarm_types.ts`: alarm module types
- Prefer extending existing interfaces over creating near-duplicate variants with only minor field differences.
- If a shared contract field is renamed, removed, or retyped, update every affected frontend and backend consumer in the same change.
- Keep comments concise. Use Chinese for business semantics and English for structural notes when both are needed.
- Validate shared-package edits with the narrowest relevant typecheck. If consumers changed too, typecheck each touched workspace rather than relying only on the shared package build.
