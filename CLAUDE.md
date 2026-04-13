# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Root-level commands (from repo root, uses Turborepo)
pnpm dev              # Start all dev servers (web:3000, docs:3001)
pnpm build            # Build all apps and packages
pnpm lint             # Lint everything (zero warnings enforced)
pnpm format           # Format with Prettier
pnpm check-types      # Type check all packages

# Database (requires Docker running)
docker compose up -d                              # Start PostgreSQL
npx prisma migrate dev --schema apps/web/prisma/schema.prisma  # Run migrations
npx prisma generate --schema apps/web/prisma/schema.prisma     # Generate client
```

There are no test commands configured yet.

## Architecture

**Turborepo monorepo** with pnpm workspaces:

- `apps/web` — Main Next.js 16 app (React 19, TypeScript 5.9)
- `apps/docs` — Documentation Next.js app
- `packages/ui` — Shared React component library (`@repo/ui`)
- `packages/eslint-config` — Shared ESLint configs (`@repo/eslint-config`)
- `packages/typescript-config` — Shared TS configs (`@repo/typescript-config`)

### Web App (`apps/web`)

**Auth:** NextAuth.js v5 (beta) with Google OAuth, Prisma adapter. Config in `apps/web/auth.ts`.

**Database:** Prisma 7 with PostgreSQL 16 (Docker). Schema at `apps/web/prisma/schema.prisma`. Prisma client is generated to `apps/web/generated/prisma` and uses a singleton pattern in `apps/web/lib/prisma.ts`.

**Middleware:** `apps/web/proxy.ts` handles auth-based routing — unauthenticated users redirect to `/auth/login`, authenticated users on `/auth/*` redirect to `/home`. Includes request logging via `apps/web/proxy/logger.ts`.

**UI:** Shadcn/ui components (Radix primitives + Tailwind CSS 4) in `apps/web/components/ui/`. Config in `apps/web/components.json`. Uses `cn()` utility from `apps/web/lib/utils.ts`.

**Path alias:** `@/*` maps to `apps/web/*` within the web app.

### Database Models

`User` ← `Account` (OAuth), `Session`, `Folder` ← `Note` (JSON content), `VerificationToken`

## Environment Variables

The web app needs these in `apps/web/.env.local`:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

Local DB default: `postgresql://lumma:lumma123@localhost:5432/lumma`
