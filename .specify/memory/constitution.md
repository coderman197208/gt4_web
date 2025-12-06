<!--
Sync Impact Report
- Version change: N/A → 1.0.0
- Modified principles:
	- [PRINCIPLE_1_NAME] → I. Type‑Safe End‑to‑End (NON‑NEGOTIABLE)
	- [PRINCIPLE_2_NAME] → II. API Contracts First
	- [PRINCIPLE_3_NAME] → III. Testing Discipline
	- [PRINCIPLE_4_NAME] → IV. Simplicity & Performance Budgets
	- [PRINCIPLE_5_NAME] → V. Observability & Security Baseline
- Added sections: None (filled existing Section 2 & 3)
- Removed sections: None
- Templates requiring updates:
	- .specify/templates/plan-template.md → ✅ aligned (Constitution Check section derives from this constitution)
	- .specify/templates/spec-template.md → ✅ aligned (no agent-specific references)
	- .specify/templates/tasks-template.md → ✅ aligned (web app path conventions match frontend/backend)
	- .specify/templates/commands/* → N/A (folder not present)
	- README/docs → N/A (not present)
- Deferred TODOs:
	- TODO(GOVERNANCE_APPROVERS): Define approver roles or CODEOWNERS for amendments
	- TODO(AUTH_STRATEGY): Select and document auth method (e.g., session, JWT, OAuth)
-->

# gt4_web Constitution

## Core Principles

### I. Type‑Safe End‑to‑End (NON‑NEGOTIABLE)

The codebase MUST use TypeScript across frontend (Vue) and backend (Node.js).
TypeScript `strict` mode MUST be enabled. Request/response payloads MUST have
compile‑time types and runtime validation on the server (e.g., Zod/TypeBox).
Shared types SHOULD live in a dedicated shared package (e.g., `packages/shared`)
or be generated from the API contract. Type mismatches or untyped any‑leaks are
compliance failures.

Rationale: End‑to‑end type safety reduces runtime defects and accelerates
refactors by making contracts explicit and verifiable.

### II. API Contracts First

Backend MUST expose JSON REST APIs with an OpenAPI (or equivalent) contract.
Every public endpoint MUST define typed request/response schemas and error
shapes. Contract changes MUST include contract tests and a migration note. API
breaking changes REQUIRE a deprecation period with a documented removal date.
Frontend clients SHOULD consume generated types/clients from the contract.

Rationale: Contract‑first development stabilizes interfaces and enables parallel
frontend/backend work with fewer integration surprises.

### III. Testing Discipline

Testing gates MUST cover: unit (modules/services), integration (API + DB), and
E2E for P1 user journeys (e.g., Playwright). CI MUST fail on test failures and
type errors. New or changed code MUST be covered by tests; E2E MUST pass for
critical flows before merge. Snapshot tests are allowed only with explicit
review justification.

Rationale: System behavior remains verifiable as features evolve, preventing
regressions and enabling safe refactors.

### IV. Simplicity & Performance Budgets

Prefer the simplest architecture that satisfies requirements. Default stack:
Vue 3 + Vite for frontend; Node.js (Fastify/Nest) for backend. Avoid premature
abstractions, layers, and patterns. Establish and track performance budgets:
typical API p95 < 200ms; initial page interactive < 2.5s on mid‑tier devices.
Any added complexity MUST be justified in the plan under “Complexity Tracking”.

Rationale: Simplicity reduces maintenance costs; explicit budgets prevent
gradual performance erosion.

### V. Observability & Security Baseline

Structured JSON logging, request correlation IDs, and centralized error handling
are REQUIRED. Input validation MUST be applied at trust boundaries. Secrets MUST
be managed via environment variables or a secret manager (never committed).
Production MUST enforce HTTPS and appropriate CORS. Apply OWASP Top 10
mitigations proportionally to risk.

Rationale: Operability and security are foundational for reliability and trust.

## Technology Stack & Constraints

- Runtime: Node.js 20+; Frontend: Vue 3 + Vite; Language: TypeScript (strict).
- Package manager: pnpm (preferred) or npm; the repository MUST use one
  consistently.
- Repo layout (web app): `backend/`, `frontend/`, optional `packages/shared/` for
  shared types/utilities.
- Quality gates: ESLint + Prettier; type‑check and build MUST pass in CI.
- API: REST + OpenAPI; server‑side validation (Zod/TypeBox) MUST guard inputs.
- Commits/branches: Conventional Commits; branches like `feat/###-name`.
- Environments: `.env.example` MUST enumerate required variables; secrets never
  committed.

## Development Workflow & Quality Gates

- PR MUST include: passing type‑check, lint, tests (unit/integration), and build
  for both `frontend` and `backend`. P1 E2E MUST pass on protected branches.
- Constitution Check (blockers):
  - TypeScript `strict` enabled across workspace
  - All public API routes documented in OpenAPI with schemas
  - Server‑side runtime validation for all external inputs
  - Tests present for new/changed code; critical E2E green
  - Logging + error handling path verified for new endpoints
- Plans/specs/tasks generated under `.specify/` MUST reflect these gates and
  directory conventions.

## Governance

- Source of truth: This constitution supersedes other practices when in
  conflict.
- Amendments: Via PR that updates this file with a version bump (SemVer), a
  summary of changes, and migration notes when applicable. Approval requires
  designated maintainers (TODO(GOVERNANCE_APPROVERS)).
- Versioning policy: MAJOR for breaking governance/principle redefinitions;
  MINOR for added/expanded principles or sections; PATCH for clarifications and
  non‑semantic edits.
- Compliance reviews: PR reviewers MUST verify Constitution Check items. A
  periodic (e.g., quarterly) review SHOULD assess adherence and propose updates.

**Version**: 1.0.0 | **Ratified**: 2025-11-15 | **Last Amended**: 2025-11-15
