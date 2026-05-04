# Lumma

App de notas para estudiantes y productividad.

> Si retomas el proyecto después de un break o estás en otra máquina, lee primero [`docs/handoff.md`](docs/handoff.md) para tener el contexto completo.

## Features actuales

- **Auth**: registro/login con email + password (Zod + bcrypt) y Google OAuth
- **Notas**: CRUD con editor rich text (BlockNote) y autosave
- **Carpetas**: organización de notas con CRUD completo
- **Inbox**: vista de notas sin clasificar (quick notes)
- **Quick capture**: tarjeta animada en `/home` que se expande a editor fullscreen
- **Feedback**: foro de comunidad con votos y rating de estrellas

## Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **DB**: PostgreSQL (Docker en local, Neon en producción)
- **ORM**: Prisma 7
- **Auth**: NextAuth.js v5
- **UI**: Tailwind CSS 4 + Shadcn/ui (Radix primitives)
- **Animaciones**: motion (framer-motion)
- **Editor**: BlockNote
- **Validación**: Zod
- **Hosting**: Vercel
- **Monorepo**: Turborepo + pnpm workspaces

## Requisitos

- **Node.js** >= 20.19 (`nvm install 20 && nvm use 20`)
- **pnpm** 9 (`npm install --global corepack@latest && corepack enable`)
- **Docker** (para PostgreSQL local)

## Setup desde cero

### 1. Clonar e instalar

```bash
git clone <url-del-repo>
cd Lumma
pnpm install
```

### 2. Levantar la base de datos local

```bash
docker compose up -d
```

PostgreSQL 16 en el puerto 5432: usuario `lumma`, password `lumma123`, base de datos `lumma`.

### 3. Variables de entorno

Crea `apps/web/.env.local` (lo usa Next.js):

```env
DATABASE_URL="postgresql://lumma:lumma123@localhost:5432/lumma"
AUTH_SECRET="cualquier-string-secreto-aqui"
GOOGLE_CLIENT_ID="tu-client-id-de-google"
GOOGLE_CLIENT_SECRET="tu-client-secret-de-google"
```

Genera un `AUTH_SECRET` con:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Las credenciales de Google se configuran en [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

> **Nota**: Prisma usa `apps/web/.env` (sin `.local`) por su `prisma.config.ts`. La `DATABASE_URL` debe estar en ambos archivos.

### 4. Aplicar migraciones a la BD local

```bash
cd apps/web
pnpm prisma migrate dev
```

### 5. Arrancar el proyecto

```bash
pnpm dev
```

Abre http://localhost:3000.

## Flujo de desarrollo

### Día a día (solo código)

```bash
docker compose up -d        # si no está corriendo
pnpm dev
```

### Cuando cambias el schema de Prisma

```bash
cd apps/web
pnpm prisma migrate dev --name "descripcion-del-cambio"
```

Aplica la migración a Docker local y regenera el cliente Prisma.

> **Importante**: tras cualquier migración o `prisma generate`, **mata el dev server (Ctrl+C) y vuelve a arrancarlo**. Next.js cachea el cliente Prisma en `globalThis` y no se actualiza con hot reload.

### Antes de hacer push (si hay migraciones nuevas)

Hay que aplicarlas a Neon (la BD de producción) ANTES de pushear, o el deploy de Vercel fallará.

1. Editar `apps/web/.env`:
   - Comentar `DATABASE_URL` de Docker
   - Descomentar la `DATABASE_URL` de Neon
2. Verifica el SQL antes de aplicar:
   ```bash
   cat prisma/migrations/[ultima-migracion]/migration.sql
   ```
3. Aplica a Neon:
   ```bash
   cd apps/web
   pnpm prisma migrate deploy
   ```
4. Revertir `.env` (descomentar Docker, comentar Neon)

### Push

```bash
git push
```

Vercel detecta el push y despliega automáticamente.

## Producción

- **Hosting**: Vercel (https://lumma-web.vercel.app)
- **Base de datos**: Neon (PostgreSQL serverless)
- **Auth**: NextAuth.js con Google OAuth + Credentials

Las variables de entorno en producción se configuran en Vercel → Settings → Environment Variables.

## Comandos útiles

| Comando | Qué hace |
|---------|----------|
| `pnpm dev` | Arranca todos los dev servers |
| `pnpm build` | Compila todo el monorepo |
| `pnpm lint` | Linter (cero warnings) |
| `pnpm check-types` | Verificar tipos TypeScript |
| `docker compose up -d` | Levantar PostgreSQL local |
| `docker compose down` | Parar PostgreSQL |
| `pnpm prisma studio` | UI visual para ver la BD |
| `pnpm prisma migrate dev --name X` | Crear y aplicar migración local |
| `pnpm prisma migrate deploy` | Aplicar migraciones (Neon en prod) |
| `pnpm prisma generate` | Regenerar cliente Prisma manualmente |

## Estructura del monorepo

```
apps/web/                       App principal (Next.js 16, React 19)
  ├── app/
  │   ├── (auth)/               Rutas públicas (login, register)
  │   └── (workspace)/          Rutas autenticadas con sidebar
  │       ├── home/
  │       ├── inbox/
  │       ├── folders/
  │       ├── feedback/
  │       └── notes/[noteId]/
  ├── components/
  │   ├── ui/                   Shadcn primitivos
  │   ├── auth/
  │   ├── folders/
  │   ├── notes/
  │   └── feedback/
  ├── server/
  │   └── actions/              Server actions (CRUD por entidad)
  ├── schemas/                  Zod schemas
  ├── lib/                      Utilidades (prisma, format-date, utils)
  └── prisma/                   Schema y migraciones

apps/docs                       Documentación (Next.js)
packages/ui                     Componentes compartidos
docs/                           Apuntes y documentación del proyecto (Obsidian)
  ├── handoff.md                ⚠️ Estado actual del proyecto - LEER PRIMERO
  ├── plan/
  ├── concepts/
  ├── decisions/
  └── changelog/
```

## Notas por SO

- **Linux**: nvm viene en la terminal directamente
- **Windows**: usa [nvm-windows](https://github.com/coreybutler/nvm-windows) para gestionar versiones de Node. Docker Desktop para los contenedores

## Troubleshooting

### "Cannot read properties of undefined (reading 'findMany')"

El cliente Prisma está en caché viejo. Soluciones:
1. `pnpm prisma generate`
2. Mata el dev server (`Ctrl+C`) y arranca con `pnpm dev`
3. Reinicia el TS server del editor (VSCode: `Ctrl+Shift+P` → "TypeScript: Restart TS Server")

### Vercel build falla con "column does not exist"

Olvidaste aplicar la migración a Neon antes de pushear. Aplica el [Workflow de migraciones a Neon](#antes-de-hacer-push-si-hay-migraciones-nuevas) y vuelve a deployar.

### Error de hidratación en sidebar

Es un mismatch conocido de Radix `Slot` + Next `Link` con `asChild`. Es **recoverable** y no afecta a la funcionalidad. Solo aparece en consola de dev. Se ignora.

### "OAuth client was not found" en Google login

Las credenciales en `.env.local` no coinciden con las de Google Cloud Console. Verifica:
1. El `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` están bien copiados (sin comillas raras, sin espacios)
2. La URL `http://localhost:3000/api/auth/callback/google` está en "Authorized redirect URIs" del cliente OAuth
3. Reiniciaste `pnpm dev` tras editar el archivo
