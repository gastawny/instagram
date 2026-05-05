# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# General Guidelines

- Always update db schemas, update seeds.

---

# Commands

All commands run from the **repo root** unless noted. Package manager is **Bun** — never use npm or yarn.

## Build & Type Check

```bash
bun run build        # Build all packages
bun run typecheck    # Typecheck all packages
bun run lint         # Lint with Biome
bun run check        # Lint + format with Biome (write)
```

## API Client (Frontend)

```bash
cd apps/www && bun run api:generate   # Regenerate Orval hooks from running OpenAPI spec (core-service must be running)
```

---

# Architecture

## Monorepo Structure

```
apps/
  api/     # Main backend API (Elysia + Bun)
  www/              # Admin frontend (TanStack Start + React 19)
packages/
  db/               # Drizzle ORM schema, migrations, client (@instagram/db)
  config/           # Shared config (@instagram/config)
docker/             # Docker Compose files (dev, test, prod)
```

## Backend: core-service

**Stack:** Elysia (Bun HTTP framework), Drizzle ORM, PostgreSQL.

**Request flow:** `HTTP → errorHandler middleware → requireAuth → authorizationContext → route handler → Service → Repository → Database`

**Module layout** (`apps/core-service/src/`):
- `http/app.ts` — Elysia instance: OpenAPI, middleware, all routes registered here
- `http/errors.ts` — ALL error codes, `AppError`, status map, envelope helpers (single source of truth)
- `http/middleware/` — `error-handler`, `request-context`, `require-auth`, `tenant-context`
- `modules/<name>/` — Each module contains: DTOs (Zod), service, repository, routes, tests
- `infra/db/` — Re-exports `db` and `sql` from `@instagram/db`
- `infra/auth/` — Authentication logic (JWT, password hashing, etc.)

**Adding a module:** Create folder under `modules/`, wire routes into `http/app.ts`. Read `docs/core-service/http-setup.md` for the full pattern.

**Error handling:** Always `throw new AppError(ERROR_CODES.X, 'message')`. Never build error envelopes manually. Status codes are derived from `getStatusForCode(code)` in the middleware.

## Frontend: www

**Stack:** React 19, TanStack Start (SSR), TanStack Router (file-based), TanStack Query, TanStack Table, shadcn/ui, Tailwind CSS 4, Orval (OpenAPI → React Query hooks), Bun test runner.

**API access rule:** **Never write manual `useQuery`/`useMutation` for endpoints in the OpenAPI spec.** Always use Orval-generated hooks from `@/http/api/generated` and types from `@/http/api/models`. Run `api:generate` when adding a new backend endpoint.

**Colors:** Only use Tailwind tokens that map to CSS variables in `src/styles.css` (e.g. `bg-background`, `text-foreground`, `bg-primary`). Never hardcode hex/rgb values.

**Feature structure:** Features must not import each other. Shared logic goes in `shared/`. Routes must contain no business logic. No `api/` directories inside feature folders — Orval replaces them.

## Database Package (`packages/db`)

- Schema files in `packages/db/schema/` — each table file must export Drizzle relations
- Migrations in `packages/db/migrations/` — immutable, never edit applied migrations
- DB client in `packages/db/client.ts` — hides `organizationId`, `createdAt`, `updatedAt` from query results by default
- **Query rule:** Use `db.query.<table>.findFirst/findMany` for entity reads; `db.select()` only for aggregates
- **Seed:** `packages/db/seed/` or `scripts/seed.ts` — guarded to never run in `NODE_ENV=production`

---

# Subagent System

Use subagents to delegate tasks to specialized agents.

## Agent Selection Guide

- **Pure Typescript**: `typescript-pro`
- **React**: `react-specialist`
- **UI/UX**: `ui-designer`
- **Security**: `security-engineer`
- **Complex Workflow**: `multi-agent-coordinator`
- **Code Review**: `code-reviewer`

## Invoking Subagents

Claude Code auto-selects agents based on context. You can also request explicitly:
```
Have the code-reviewer analyze my latest commits
Ask security-engineer to audit the auth middleware
```

---

# Code Conventions

## TypeScript

- Strict mode enabled
- Avoid `any`
- Prefer explicit types
- Prefer `satisfies` over `as` for constraining object shapes; avoid `as` type assertions unless there is no safer alternative.

## Naming

- Files: kebab-case
- Classes: PascalCase
- Functions/variables: camelCase

## Error Handling

- Explicit domain errors (`AppError` in backend, domain error classes in services)
- Global HTTP error middleware — never build error responses in handlers
- Never swallow exceptions silently

## Comments

- Do not use comments to explain the code, use code to explain the code.

## Environment Variables

- Each app/package reads `process.env` only in its own `src/env.ts`; all other files import from there
- Every app/package must have `.env.example` and `.env` in its own directory

---