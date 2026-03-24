---
name: web-project-conventions
description: Best practices for web project conventions built with Next.js, React, and TypeScript (structure, naming, imports, exports).
---

## Core Principles

- Keep changes small, correct, and reviewable.
- Keep architecture consistent across features.
- Avoid accidental coupling between UI primitives and domain logic.

## Project Structure

- docs/ — project documentation and design specs
- infra/ — infrastructure-as-code (Bicep templates and parameters)
- web/ — all application code for this application must live under `web/`. Do not add application code outside this folder.
- .github/ — GitHub-specific files (workflows, skills, agents)
- .vscode/ — workspace settings
- .azure/ — Azure-specific config (e.g., for VS Code extensions)

### Web Application Project Structure

- Routing (Next.js App Router): `web/app/`
  - Route modules live under `web/app/**` (e.g., `page.tsx`, `layout.tsx`, `loading.tsx`).
  - Prefer rendering feature entry components from route modules (keeps routing thin).
  - Route handlers (e.g., `web/app/api/**/route.ts`) must stay thin: parse input, call feature/shared logic, return response.

- Features (domain modules): `web/features/<feature>/`
  - Owns domain components, hooks, state, and feature-specific utilities.
  - Provide a single feature entry component (e.g., `web/features/profile/profile-page.tsx`) that routes render.
- Shared (cross-feature domain concerns): `web/features/shared/`
  - Use for API clients, auth, shared domain helpers, and utilities used by multiple features.
  - Use for server-only domain logic used by API routes or server actions.
  - Prefer shared modules over cross-feature deep imports.
- Reusable components: `web/components/`
  - `web/components/ui/`: primitives only (no domain logic, no data fetching).
  - `web/components/blocks/`: reusable compositions built from primitives (avoid feature-specific state/logic).
  - `web/components/lib/utils.ts`: shared helpers (includes `cn()`).

## Dependency Direction

- `web/features/*` may import from `web/components/*` and `web/features/shared/*`.
- `web/components/*` should not import from `web/features/*` (keeps primitives/compositions reusable).
- Avoid cross-feature imports like `web/features/a/* -> web/features/b/*`; promote shared code to `web/features/shared/*` instead.
- API route handlers and server actions should import from `web/features/*` or `web/features/shared/*`, not from `web/components/*`.

## Naming

- Components, types, enums: PascalCase (e.g., `UserProfile`, `ControlCenterPage`).
- Hooks, functions, variables: camelCase (e.g., `useAuth`, `formatDate`).
- Files/folders: kebab-case (e.g., `user-profile.tsx`, `use-auth.ts`, `format-date.ts`).

## Imports

- Prefer absolute imports via the repo alias (e.g., `@/components/ui/button`, `@/features/home/home-page`).
  - Treat `@/` as the `web/` root.
- Avoid deep relative imports across domains (e.g., `../../..`).

## Server Actions

- Prefer colocating server actions with the feature that owns the domain behavior.
- Keep server actions thin: validate input, call feature/shared logic, return structured results.
- Server actions can import shared server-only utilities from `web/features/shared/`.

## API Clients

- Define API clients in `web/features/shared/`.
- Feature modules should consume API clients via shared modules (avoid ad-hoc fetch logic in UI components).

## Exports

- Prefer named exports in shared modules (more stable refactors and easier searchability).
- Default exports are fine where conventions require them (Next.js route modules like `page.tsx`, `layout.tsx`).
