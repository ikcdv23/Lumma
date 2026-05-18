<div align="center">

# Lumma

**Notas y estudio enfocado para estudiantes y curiosos.**

Una app de notas con un modo de estudio sin distracciones: eliges qué material vas a usar, pones un timer y desapareces del mundo hasta que tu sol se ponga.

[![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

<br/>

<img src="apps/web/public/img/home-page.png" alt="Pantalla principal de Lumma" width="100%"/>

</div>

<br/>

> [!NOTE]
> Si retomas el proyecto después de un break o estás en otra máquina, lee primero [`docs/handoff.md`](docs/handoff.md) para tener el contexto completo.

<br/>

## Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>Notas rápidas con captura animada</h3>
      <p>Una tarjeta en <code>/home</code> se expande a editor fullscreen con animación shared-layout. Lo que escribes va directo a tu Inbox con autosave por debounce.</p>
    </td>
    <td width="50%">
      <img src="apps/web/public/img/notes-grid.png" alt="Grid de notas"/>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="apps/web/public/img/notion-like-editor.png" alt="Editor estilo Notion con BlockNote"/>
    </td>
    <td width="50%" valign="top">
      <h3>Editor rico tipo Notion</h3>
      <p>Construido sobre <a href="https://www.blocknotejs.org">BlockNote</a> con Shiki para syntax highlighting en 14 lenguajes. Autosave silencioso con indicador de estado.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>Solarium — sesiones de estudio enfocadas</h3>
      <p>El modo Zen de Lumma. Eliges carpetas y notas, fijas duración y entras a un workspace sin distracciones — sin sidebar, con timer flotante y pestañas multi-herramienta sobre tu material.</p>
      <p><em>Tu sol amanece, llega al mediodía y se pone según los minutos que estudias al día.</em></p>
    </td>
    <td width="50%">
      <img src="apps/web/public/img/solarium-01.png" alt="Página de Solarium con progreso del día"/>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="apps/web/public/img/solarium-config.png" alt="Configuración de sesión Solarium"/>
    </td>
    <td width="50%" valign="top">
      <h3>Configuración mínima, foco máximo</h3>
      <p>Pomodoro, sprint o sesión libre. Selecciona el material en segundos y empieza. Sin friction, sin opciones de más.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>Workspace activo y timer flotante</h3>
      <p>Editor, tareas y tablero como pestañas en el mismo espacio. El timer queda colapsado por defecto en una esquina y se expande con un click — no rompe tu concentración.</p>
    </td>
    <td width="50%">
      <img src="apps/web/public/img/solarium-02.png" alt="Workspace activo en Solarium"/>
    </td>
  </tr>
</table>

<br/>

## Stack

- **Framework** — Next.js 16 (App Router) + React 19
- **Lenguaje** — TypeScript 5.9 estricto
- **Base de datos** — PostgreSQL 16 (Docker local, [Neon](https://neon.tech) en producción)
- **ORM** — Prisma 7
- **Auth** — NextAuth.js v5 (Google OAuth + Credentials con bcrypt)
- **UI** — Tailwind CSS 4 + [Shadcn/ui](https://ui.shadcn.com) sobre Radix primitives
- **Animaciones** — [motion](https://motion.dev) (Framer Motion)
- **Editor** — [BlockNote](https://www.blocknotejs.org) + Shiki
- **Validación** — Zod
- **Hosting** — Vercel
- **Monorepo** — Turborepo + pnpm workspaces

<br/>

## Setup

### Requisitos

- Node.js >= 20.19 (`nvm install 20`)
- pnpm 9 (`corepack enable`)
- Docker (PostgreSQL local)

### Levantar el proyecto

```bash
git clone <url-del-repo>
cd Lumma
pnpm install
docker compose up -d
```

Crea `apps/web/.env.local`:

```env
DATABASE_URL="postgresql://lumma:lumma123@localhost:5432/lumma"
AUTH_SECRET="cualquier-string-secreto"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

> Genera un secret con `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Credenciales de Google en [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

Aplica migraciones y arranca:

```bash
cd apps/web && pnpm prisma migrate dev
cd ../.. && pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000). 🎉

<br/>

<details>
<summary><b>Cambios en el schema de Prisma</b></summary>

```bash
cd apps/web
pnpm prisma migrate dev --name "descripcion-del-cambio"
```

> Tras cualquier `prisma migrate` o `prisma generate`, **mata el dev server y arráncalo de nuevo**. Next.js cachea el cliente Prisma en `globalThis` y el hot reload no lo recoge.

</details>

<details>
<summary><b>Aplicar migraciones a Neon (antes de pushear)</b></summary>

Vercel compila contra Neon. Si pusheas con una migración sin aplicar, el build cae.

1. Edita `apps/web/.env`: comenta el `DATABASE_URL` de Docker y descomenta el de Neon.
2. Inspecciona el SQL: `cat apps/web/prisma/migrations/<latest>/migration.sql`
3. Aplica: `cd apps/web && pnpm prisma migrate deploy`
4. Revierte `.env` a Docker.

</details>

<details>
<summary><b>Comandos útiles</b></summary>

| Comando | Qué hace |
|---------|----------|
| `pnpm dev` | Arranca todos los dev servers (web:3000, docs:3001) |
| `pnpm build` | Compila todo el monorepo |
| `pnpm lint` | Linter (cero warnings) |
| `pnpm check-types` | Verificar tipos |
| `pnpm format` | Prettier |
| `docker compose up -d` | Levantar PostgreSQL local |
| `pnpm prisma studio` | UI visual para inspeccionar la BD |

</details>

<br/>

## Arquitectura

Turborepo monorepo, **3 capas por feature** dentro de `apps/web/server/`:

```
repository.ts  →  Acceso a datos. Prisma filtrado por userId. Sin auth, sin lógica.
service.ts     →  Lógica de negocio. Recibe userId, llama al repo. Validación, algoritmos.
actions.ts     →  "use server" mutations. Auth + service + revalidatePath. Capa fina.
```

**Reglas básicas**

- Los **services no llaman a otros services**. La orquestación cross-feature ocurre en la action.
- Las lecturas cross-feature van directas al repository de la otra feature.
- Server Components leen del service directamente. Solo las mutaciones pasan por actions.

Detalle completo en [`docs/concepts/arquitectura.md`](docs/concepts/arquitectura.md).

```
apps/
  web/                     App principal (Next.js 16)
    app/
      (auth)/              login, register
      (workspace)/         home, inbox, folders, notes, feedback, profile, solarium
      (solariumspace)/     /active — workspace sin distracciones
    components/
      ui/                  Shadcn primitives
      motion/              Variantes y wrappers de motion
      loaders/             Spinner, progress bar, skeletons
      auth/ folders/ notes/ feedback/ solarium/ profile/
    server/
      auth/ user/ folder/ note/ feedback/ solarium/
    prisma/                Schema y migraciones
  docs/                    Docs site

docs/                      Apuntes Obsidian
  handoff.md               ⚠ Estado actual del proyecto
  concepts/ plan/ decisions/ changelog/
```

<br/>

## Producción

Hosting en [Vercel](https://vercel.com), base de datos en [Neon](https://neon.tech). Variables de entorno en Vercel → Settings → Environment Variables. El build corre `prisma generate && next build`.

<br/>

## Troubleshooting

<details>
<summary><b><code>Cannot read properties of undefined (reading 'findMany')</code></b></summary>

Cliente Prisma cacheado. Soluciones:

1. `pnpm prisma generate`
2. Mata el dev server (`Ctrl+C`) y `pnpm dev`
3. Reinicia TS Server del editor

</details>

<details>
<summary><b>Vercel falla con <code>column does not exist</code></b></summary>

No aplicaste la migración a Neon antes de pushear. Sigue el workflow de Neon de arriba y vuelve a deployar.

</details>

<details>
<summary><b>Error de hidratación en sidebar</b></summary>

Mismatch conocido de Radix `Slot` + Next `Link` con `asChild`. **Recoverable**, solo aparece en dev. Se ignora.

</details>

<details>
<summary><b><code>OAuth client was not found</code> en Google login</b></summary>

Credenciales mal copiadas o sin la redirect URI configurada:

1. `GOOGLE_CLIENT_ID`/`SECRET` sin comillas raras ni espacios
2. `http://localhost:3000/api/auth/callback/google` en "Authorized redirect URIs" del cliente OAuth
3. Reinicia `pnpm dev` tras editar el `.env`

</details>

<br/>

<div align="center">
  <sub>Hecho con cariño por <a href="https://github.com/ikcdv23">Javier</a>.</sub>
</div>
