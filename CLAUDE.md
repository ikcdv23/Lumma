# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> When picking up work after a break, **read [`docs/handoff.md`](docs/handoff.md) first** — it tracks current phase, pending decisions, and known bugs. For architecture details, see [`docs/concepts/arquitectura.md`](docs/concepts/arquitectura.md).

## Build & Development Commands

```bash
# Root (Turborepo)
pnpm dev              # All dev servers (web:3000, docs:3001)
pnpm build            # Build all apps and packages
pnpm lint             # Lint everything (zero warnings enforced)
pnpm format           # Prettier
pnpm check-types      # Type check (runs `next typegen && tsc --noEmit` in web)

# Database (Docker must be running)
docker compose up -d
cd apps/web && pnpm prisma migrate dev --name <change>   # Local schema change
cd apps/web && pnpm prisma generate                       # Regenerate client
cd apps/web && pnpm prisma studio                         # DB UI
```

No tests are configured yet.

### Prisma quirks — important

- **Two env files**: Next.js reads `apps/web/.env.local`. Prisma CLI reads `apps/web/.env` (loaded via `prisma.config.ts`). `DATABASE_URL` must be present in **both**.
- **After any `prisma migrate` or `prisma generate`**, kill and restart `pnpm dev`. Next.js caches the Prisma client on `globalThis` and hot reload will not pick up the new client (see [`apps/web/lib/prisma.ts`](apps/web/lib/prisma.ts)).
- Generated client lives at `apps/web/generated/prisma` (not `@prisma/client`). Import types from `@/generated/prisma/client`.

### Migrations to production (Neon) — required before pushing schema changes

Vercel builds against Neon and will fail if a migration is unmerged. Before `git push` when there's a new migration:

1. In `apps/web/.env`, swap `DATABASE_URL` from the Docker URL to the Neon URL.
2. Inspect the SQL: `cat apps/web/prisma/migrations/<latest>/migration.sql`
3. Apply: `cd apps/web && pnpm prisma migrate deploy`
4. Revert `apps/web/.env` back to the Docker URL.

## Architecture

**Turborepo monorepo** with pnpm workspaces:

- `apps/web` — main Next.js 16 app (App Router, React 19, TypeScript 5.9)
- `apps/docs` — docs site
- `packages/ui` — shared React components (`@repo/ui`)
- `packages/eslint-config`, `packages/typescript-config` — shared configs

Path alias inside `apps/web`: `@/*` → `apps/web/*`.

### Route groups (`apps/web/app`)

- `(auth)` — public routes: `/login`, `/register`. No sidebar.
- `(workspace)` — authenticated app shell with sidebar: `/home`, `/inbox`, `/folders/[id]`, `/notes/[noteId]`, `/feedback`, `/profile`, `/solarium`.
- `(solariumspace)` — distraction-free shell for active study sessions: `/active`. Has its own layout (no sidebar, by design — "Zen" philosophy).

### Auth

NextAuth.js v5 (beta) with Google OAuth + Credentials (email/password via bcrypt). Prisma adapter, JWT sessions. Config in [`apps/web/auth.ts`](apps/web/auth.ts).

[`apps/web/proxy.ts`](apps/web/proxy.ts) is the middleware: unauthenticated users redirect to `/login`; authenticated users on `/login`|`/register` redirect to `/home`. It also clears NextAuth cookies on JWT decode errors (broken session → forced login) and pipes through [`apps/web/proxy/logger.ts`](apps/web/proxy/logger.ts).

### Server-side layering (the 3-layer pattern)

The codebase is mid-migration to a clean 3-layer structure, **per feature**. The Solarium feature is the reference implementation in [`apps/web/server/solarium/`](apps/web/server/solarium/):

```
repository.ts  → data access only. Prisma calls, filtered by userId. No auth, no business logic.
service.ts     → business logic. Receives userId, calls repo. Idempotency, validation, algorithms.
actions.ts     → "use server" mutations. auth() + service call + revalidatePath. Thin.
```

Rules of thumb (see [`docs/concepts/arquitectura.md`](docs/concepts/arquitectura.md)):
- **Services do not call other services.** Cross-feature orchestration happens in the action layer. Cross-feature **reads** go directly against the other feature's repository, never its service.
- Server Components call services directly for reads; only mutations go through actions.
- Use [`apps/web/lib/auth-helper.ts`](apps/web/lib/auth-helper.ts) → `getAuthedUserId()` in new actions instead of inlining `auth()`.

The older `apps/web/server/actions/*-actions.ts` files (notes, folders, feedback, auth, user) are the legacy single-layer pattern (action talks to Prisma directly). New features should follow the 3-layer pattern; legacy actions are refactored opportunistically.

### Database

Prisma 7 + PostgreSQL 16 (Docker locally, Neon in prod). Schema: [`apps/web/prisma/schema.prisma`](apps/web/prisma/schema.prisma).

Models: `User` ← `Account` / `Session` / `Folder` (→ `Note`) / `Note` / `FeedbackPost` (← `FeedbackVote`) / `StudySession`. `StudySession` has many-to-many with `Folder` and `Note`, status enum `ACTIVE`|`COMPLETED`|`ABANDONED`, and a `lastSeenAt` heartbeat used for lazy-cleanup of stale sessions (see [`solarium.service.ts`](apps/web/server/solarium/solarium.service.ts) `getActiveSession`).

### UI

Shadcn/ui (Radix primitives + Tailwind CSS 4) in `apps/web/components/ui/`. Custom variants live in sibling files like `sidebar-variants.ts`. Components grouped by feature: `auth/`, `folders/`, `notes/`, `feedback/`, `solarium/`, `profile/`.

Known gotcha: Radix `Slot` + Next `<Link>` + `asChild` produces a hydration mismatch warning. It's recoverable and ignored. Same issue appears with `CollapsibleTrigger asChild + SidebarMenuButton` — workaround is to drop `asChild` and apply the variant directly to a `<button>`/`<Link>`.

Editor: BlockNote with Shiki syntax highlighting (14 languages configured). Autosave with debounce.

## Environment variables (`apps/web/.env.local`)

```
DATABASE_URL="postgresql://lumma:lumma123@localhost:5432/lumma"
AUTH_SECRET="..."   # generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

Production env vars are configured in Vercel. Build runs `prisma generate && next build` (see [`apps/web/package.json`](apps/web/package.json)).
