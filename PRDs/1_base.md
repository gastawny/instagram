# PRD — Monorepo Project Setup

**Version:** 1.1  
**Date:** 2026-05-01  
**Status:** Draft

---

## 1. Overview

This document describes the requirements for setting up a modern monorepo with a clear separation between backend and frontend. The architecture emphasizes modularity, type-safety, developer experience, and performance throughout the entire stack.

---

## 2. Goals

- Establish a monorepo structure with unified dependency management via Bun Workspaces
- Configure a type-safe backend with Elysia and Drizzle ORM connected to PostgreSQL
- Configure a modern frontend with TanStack Start, auto-generated HTTP client via Orval (fetch-based), Tailwind CSS, and Shadcn/UI
- Enforce consistent code quality with Biome as the unified linter and formatter
- Structure each app using a modular architecture to ensure scalability and separation of concerns
- Minimize onboarding friction with well-defined scripts and conventions

---

## 3. Scope

### 3.1 In Scope

| Area | Deliverable |
|---|---|
| Monorepo | Folder structure, workspace config, root scripts |
| Backend | Elysia app with modular routing, Drizzle config, migrations, example schema |
| Frontend | TanStack Start app with modular structure, Orval config (fetch), Tailwind, Shadcn init |
| Tooling | Unified Biome config, base tsconfig, environment variables |

### 3.2 Out of Scope

- CI/CD pipeline
- Deployment and infrastructure
- Authentication and authorization
- Production database provisioning

---

## 4. Project Structure

```
apps/
  api/     # Main backend API (Elysia + Bun)
  www/              # Admin frontend (TanStack Start + React 19)
packages/
  db/               # Drizzle ORM schema, migrations, client (@instagram/db)
  config/           # Shared config (@instagram/config)
docker/             # Docker Compose files (dev, test, prod)
```

---

## 5. Modular Architecture

Both apps follow a **feature-module** convention. Each module is self-contained and owns its own routes, handlers, services, and data access logic. Modules communicate only through explicit imports — never through global state or circular dependencies.

### 5.1 Backend Module Structure (`apps/api`)

```
apps/api/
├── src/
│   ├── index.ts                    # app entry point — composes all modules
│   ├── app.ts                      # Elysia instance configuration
│   │
│   ├── db/
│   │   ├── index.ts                # Drizzle client instance
│   │   ├── schema.ts               # re-exports all module schemas
│   │   └── migrations/             # generated migration files
│   │
│   └── modules/
│       ├── health/
│       │   └── health.routes.ts    # GET /health
│       │
│       └── {feature}/
│           ├── {feature}.routes.ts   # Elysia route definitions
│           ├── {feature}.service.ts  # business logic
│           └── {feature}.dtos.ts    # local TypeScript dtos / Zod schemas
│
├── drizzle.config.ts
├── tsconfig.json
└── package.json
```

**Module composition in `src/index.ts`:**

```ts
import { app } from "./app"
import { healthRoutes } from "./modules/health/health.routes"
import { userRoutes } from "./modules/users/users.routes"

app
  .use(healthRoutes)
  .use(userRoutes)
  .listen(process.env.PORT ?? 3333)

export type App = typeof app
```

### 5.2 Frontend Module Structure (`apps/web`)

```
apps/web/
├── src/
│   ├── main.tsx                    # app entry point
│   ├── router.tsx                  # TanStack Router configuration
│   │
│   ├── routes/                     # file-based routing (TanStack Start convention)
│   │   ├── __root.tsx              # root layout
│   │   ├── index.tsx               # / route
│   │   └── {feature}/
│   │       ├── index.tsx           # /{feature} route
│   │       └── $id.tsx             # /{feature}/:id route
│   │
│   ├── modules/
│   │   └── {feature}/
│   │       ├── components/         # feature-specific UI components
│   │       ├── hooks/              # feature-specific hooks
│   │       ├── services/           # wrappers around Orval-generated client
│   │
│   ├── components/
│   │   ├── ui/                     # Shadcn/UI primitives (auto-generated, do not edit)
│   │   └── common/                 # shared, non-feature-specific components
│   │
│   ├── lib/
│   │   └── utils.ts                # cn() and other shared utilities
│   │
│   └── api/                        # Orval-generated client (gitignored)
│
├── orval.config.ts
├── components.json                 # Shadcn config
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 6. Requirements

### 6.1 Monorepo — Bun Workspaces

**RF-01** The root `package.json` must declare workspaces and provide top-level scripts:

```json
{
  "name": "my-app",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "bun run --filter '*' dev",
    "build": "bun run --filter '*' build",
    "lint": "biome check .",
    "format": "biome format --write .",
    "typecheck": "bun run --filter '*' typecheck",
    "db:generate": "bun run --filter api db:generate",
    "db:migrate": "bun run --filter api db:migrate",
    "db:studio": "bun run --filter api db:studio",
    "api:gen": "bun run --filter web api:gen"
  }
}
```

**RF-02** All dependencies must be installed from the root via `bun install`.

**RF-03** Internal packages must use the `@app/*` naming prefix (e.g., `@app/types`).

---

### 6.2 Backend — Elysia + Drizzle + PostgreSQL

**RF-04** The backend must run on port `3333` by default, configurable via the `PORT` environment variable.

**RF-05** The Elysia instance must be created in `src/app.ts` and exported for composition and type inference.

**RF-06** Each domain feature must be implemented as an Elysia plugin in its own `{feature}.routes.ts` file and registered in `src/index.ts`.

**RF-07** The app must expose a `GET /health` endpoint returning `{ status: "ok" }` with HTTP 200.

**RF-08** The app must serve an OpenAPI specification at `/swagger` using `@elysiajs/swagger`.

**RF-09** The Drizzle client must connect to **PostgreSQL** via the `DATABASE_URL` environment variable using the `postgres` (postgres.js) driver.

**RF-10** Each module's table definitions must live in its own `{feature}.schema.ts` file. The root `src/db/schema.ts` re-exports all module schemas as the Drizzle config's single source of truth:

```ts
// src/db/schema.ts
export * from "../modules/users/users.schema"
export * from "../modules/posts/posts.schema"
```

**RF-11** The following database scripts must be available inside `apps/api`:

| Script | Description |
|---|---|
| `bun run db:generate` | Generate a new migration from schema changes |
| `bun run db:migrate` | Apply pending migrations to the database |
| `bun run db:studio` | Open Drizzle Studio |

**RF-12** The `drizzle.config.ts` must point to `./src/db/schema.ts` and output migrations to `./src/db/migrations/`.

**RF-13** The `App` type must be exported from `src/index.ts` for end-to-end type inference:

```ts
export type App = typeof app
```

---

### 6.3 Frontend — TanStack Start + Orval + Tailwind + Shadcn

**RF-14** TanStack Start must be configured with file-based routing in `src/routes/`, following the `__root.tsx` + nested route convention.

**RF-15** Orval must be configured in `orval.config.ts` to:
- Consume the OpenAPI spec from `http://localhost:3333/swagger/json`
- Use the **`fetch`** client — no Axios or any third-party HTTP library
- Output the generated client to `src/api/`
- Name files by `operationId`
- Clean the output directory before each generation

```ts
// orval.config.ts
import { defineConfig } from "orval"

export default defineConfig({
  api: {
    input: "http://localhost:3333/swagger/json",
    output: {
      target: "./src/api",
      client: "fetch",
      clean: true,
    },
  },
})
```

**RF-16** The generated `src/api/` directory must be listed in `.gitignore` and regenerated via `bun run api:gen`.

**RF-17** Feature modules in `src/modules/{feature}/services/` must wrap Orval-generated functions. Components and hooks must never call the generated client directly.

**RF-18** Tailwind CSS must be configured with:
- `darkMode: "class"`
- `content` glob covering `./src/**/*.{ts,tsx}`

**RF-19** Shadcn/UI must be initialized with:
- Style: `default`
- Base color: `neutral`
- CSS variables: enabled
- Path alias `@/` pointing to `./src/`

**RF-20** Shadcn primitives generated via CLI must live in `src/components/ui/` and must not be manually edited.

---

### 6.4 Tooling — Biome

**RF-21** `biome.json` at the root must cover all `.ts` and `.tsx` files across the monorepo.

**RF-22** The recommended ruleset must be enabled via `"extends": ["recommended"]`.

**RF-23** Formatter settings must be:
- Indent: 2 spaces
- Quotes: double
- Semicolons: always

**RF-24** Biome replaces both ESLint and Prettier. Neither must be installed anywhere in the monorepo.

**RF-25** A pre-commit hook must run `biome check --apply` on staged files before every commit (via `lint-staged` or Bun's native hooks).

---

## 7. Environment Variables

### `.env.example`

```env
# API
PORT=3333
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# Web
VITE_API_URL=http://localhost:3333
```

---

## 8. Consolidated Scripts

### Root

| Script | Description |
|---|---|
| `bun dev` | Start backend and frontend in parallel |
| `bun build` | Build all apps |
| `bun lint` | Run Biome across the entire monorepo |
| `bun format` | Format the entire monorepo with Biome |
| `bun typecheck` | Run `tsc --noEmit` across all packages |
| `bun db:generate` | Generate Drizzle migrations |
| `bun db:migrate` | Apply migrations |
| `bun db:studio` | Open Drizzle Studio |
| `bun api:gen` | Regenerate the Orval HTTP client |

---

## 9. Key Dependencies

### Backend (`apps/api`)

| Package | Role |
|---|---|
| `elysia` | HTTP framework |
| `@elysiajs/swagger` | OpenAPI spec generation |
| `drizzle-orm` | Type-safe ORM |
| `drizzle-kit` | Migration CLI |
| `postgres` | PostgreSQL driver (postgres.js) |

### Frontend (`apps/web`)

| Package | Role |
|---|---|
| `@tanstack/start` | Fullstack / SSR framework |
| `@tanstack/react-router` | File-based routing |
| `orval` | OpenAPI → fetch client generator |
| `tailwindcss` | Utility-first CSS |
| `shadcn/ui` | Accessible UI component library |

### Root / Tooling

| Package | Role |
|---|---|
| `@biomejs/biome` | Unified linter + formatter |
| `typescript` | Base language |
| `bun` | Runtime, package manager, workspace orchestrator |

---

## 10. Acceptance Criteria

- [ ] `bun install` at root installs all dependencies without errors
- [ ] `bun dev` starts the backend on `localhost:3333` and the frontend on `localhost:3000`
- [ ] `GET /health` returns `{ status: "ok" }` with HTTP 200
- [ ] `GET /swagger` returns the Swagger UI with the full OpenAPI spec
- [ ] `bun db:generate` creates a migration file without errors
- [ ] `bun db:migrate` applies migrations to a running PostgreSQL instance
- [ ] `bun api:gen` generates a fetch-based client in `apps/web/src/api/`
- [ ] `bun lint` passes across all files with no errors
- [ ] `bun typecheck` passes across all packages with no errors
- [ ] Adding a Shadcn component via CLI places it in `apps/web/src/components/ui/`
- [ ] A new backend feature can be added by creating a module folder without modifying files outside it
- [ ] A new frontend feature can be added by creating a module folder without modifying files outside it

---

## 11. Design Decisions

| Decision | Rationale |
|---|---|
| Bun as runtime and package manager | Superior performance over Node/npm; native TypeScript and workspace support out of the box |
| Elysia for the backend | High performance, native OpenAPI generation, full end-to-end type inference via Eden |
| Drizzle ORM | Complete type-safety derived from the schema; explicit SQL when needed; no runtime magic |
| PostgreSQL | Battle-tested relational database with strong Drizzle and ecosystem support |
| TanStack Start | SSR-capable React framework with first-class TanStack Router and Query integration |
| Orval with `fetch` client | Auto-generates typed functions from OpenAPI; native `fetch` avoids an extra HTTP dependency |
| Modular architecture | Each feature is self-contained; scales well and prevents coupling between unrelated domains |
| Biome over ESLint + Prettier | Single tool, minimal configuration, orders of magnitude faster than the traditional toolchain |