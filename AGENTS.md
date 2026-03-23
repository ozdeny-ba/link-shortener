# Link Shortener — Agent Instructions

This file defines the coding standards and conventions that all LLM agents must follow when working on this project. Read this file in full before making any changes.

> **MANDATORY**: Before writing a single line of code, you MUST read every relevant file in the `/docs` directory for the area you are working in. This is non-negotiable. Skipping this step will result in incorrect, inconsistent, or non-compliant code. Do not rely on summaries or memory — open and read the file every time.

---

## Project Overview

A full-stack link shortening service built with Next.js App Router, backed by a PostgreSQL database (Neon serverless), authenticated via Clerk, and styled with Tailwind CSS and shadcn/ui components.

---

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Framework      | Next.js 16 (App Router)                         |
| Language       | TypeScript 5 (strict mode)                      |
| Styling        | Tailwind CSS v4                                 |
| UI Components  | shadcn/ui (Radix UI + CVA)                      |
| Icons          | lucide-react                                    |
| ORM            | Drizzle ORM                                     |
| Database       | Neon PostgreSQL (serverless)                    |
| Auth           | Clerk (`@clerk/nextjs`)                         |
| Linting        | ESLint 9 (`eslint-config-next`)                 |

---

## Project Structure

```
app/               # Next.js App Router — pages, layouts, server actions
components/
  ui/              # shadcn/ui primitives only — do not add business logic here
db/
  index.ts         # Drizzle client singleton
  schema.ts        # All table definitions live here
lib/
  utils.ts         # Shared utility functions (cn(), etc.)
docs/              # Domain-specific agent instructions (see below)
public/            # Static assets
drizzle.config.ts  # Drizzle Kit configuration
```

---

## Coding Standards

### TypeScript
- Strict mode is enabled — never use `any`; use `unknown` and narrow with type guards when needed.
- Prefer `type` over `interface` for object shapes unless declaration merging is required.
- Always annotate function return types for exported functions and server actions.
- Use the `@/*` path alias (maps to the project root) for all internal imports — never use relative `../../` paths.

### React & Next.js
- Use the App Router exclusively — never create `pages/` directory files.
- Default all components to **Server Components**. Only add `"use client"` when the component requires browser APIs, event handlers, or React state/effects.
- Co-locate a route's server action in the same `page.tsx` or in a sibling `actions.ts` file when the action is only used by that route.
- Use `next/image` for all images and `next/link` for all internal navigation.
- Keep `layout.tsx` files lean — providers and persistent UI only.

### Styling
- Use Tailwind CSS utility classes exclusively — do not write custom CSS outside of `app/globals.css` (CSS variables and base styles only).
- Compose class strings with the `cn()` helper from `@/lib/utils` — never concatenate raw strings.
- Use the design-token CSS variables (`bg-background`, `text-foreground`, etc.) rather than hardcoded colours where possible.
- Follow the Tailwind v4 approach — no `tailwind.config.js`; configuration lives in `globals.css`.

### Components
- See [`docs/components.md`](docs/components.md) for full component conventions.
- **All UI elements must use shadcn/ui** — do not create custom components when a shadcn/ui primitive exists.
- New shadcn/ui primitives are added via the `shadcn` CLI — never copy-paste and manually edit the generated file unless customising variants.
- Business-logic components live in `components/` at the feature level, not inside `components/ui/`.

### Database
- See [`docs/database.md`](docs/database.md) for Drizzle ORM and schema conventions.
- All database access must go through the `db` singleton exported from `@/db/index.ts`.
- Run schema changes through Drizzle Kit migrations — never alter the database directly.

### Authentication
- See [`docs/authentication.md`](docs/authentication.md) for Clerk integration patterns.
- Clerk is the **only** permitted auth method — never use any other auth library.
- `/dashboard` is a protected route and must require the user to be logged in.
- Authenticated users visiting `/` must be redirected to `/dashboard`.
- Sign-in and sign-up must always launch as a **modal** (`mode="modal"`) — never as standalone pages.
- All routes that require an authenticated user must be protected server-side — do not rely on client-side guards alone.
- **NEVER use `middleware.ts`** — the `middleware` file convention is deprecated in Next.js 16 (the version used in this project). Clerk middleware (`clerkMiddleware`) must live in **`proxy.ts`** at the project root instead.

### API & Server Actions
- See [`docs/api.md`](docs/api.md) for route handler and server action conventions.
- Prefer **Server Actions** over Route Handlers for form mutations.
- Validate all user input at the server boundary before touching the database.
- Never expose raw database errors to the client.

---

## Environment Variables

| Variable        | Description                         |
| --------------- | ----------------------------------- |
| `DATABASE_URL`  | Neon PostgreSQL connection string   |
| `CLERK_*`       | Clerk publishable/secret key pairs  |

- Never commit `.env` files.
- Access env vars server-side only — never import them in Client Components.
- Use the `!` non-null assertion (e.g. `process.env.DATABASE_URL!`) only after confirming the variable is required at startup.

---

## Quality Gates

Before considering any task complete:

1. `npm run lint` passes with no errors or warnings.
2. `npx tsc --noEmit` reports no type errors.
3. No `any` types, unused imports, or `console.log` statements left in committed code.
4. All new database-facing code is validated at the server boundary.

---

## Domain-Specific Docs

> **CRITICAL — YOU MUST READ THESE FILES**: Before generating any code related to the topics below, you are **required** to open and read the corresponding file in full using your file-reading tools. Do not guess, infer from memory, or skip this step. Failure to read the relevant doc before coding is a violation of these agent instructions.

| File                                           | Topic                                    | When to read                              |
| ---------------------------------------------- | ---------------------------------------- | ----------------------------------------- |
| [`docs/database.md`](docs/database.md)         | Drizzle ORM, schema, migrations          | Any database schema or query work         |
| [`docs/authentication.md`](docs/authentication.md) | Clerk auth patterns, route protection | Any auth, session, or protected-route work |
| [`docs/components.md`](docs/components.md)     | UI component conventions, shadcn/ui      | Any component creation or UI work         |
| [`docs/api.md`](docs/api.md)                   | Server actions, route handlers           | Any server action or API route work       |
