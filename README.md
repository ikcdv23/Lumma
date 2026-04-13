# Lumma

App de notas para estudiantes y productividad.

## Requisitos

- **Node.js** >= 20.19 (usa `nvm install 20 && nvm use 20`)
- **pnpm** 9 (`npm install --global corepack@latest && corepack enable`)
- **Docker** (para PostgreSQL)

## Setup desde cero

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repo>
cd Lumma
pnpm install
```

### 2. Levantar la base de datos

```bash
docker compose up -d
```

Esto arranca PostgreSQL 16 en el puerto 5432 con usuario `lumma`, password `lumma123`, base de datos `lumma`.

### 3. Variables de entorno

Crea el archivo `apps/web/.env.local`:

```env
DATABASE_URL=postgresql://lumma:lumma123@localhost:5432/lumma
NEXTAUTH_SECRET=cualquier-string-secreto-aqui
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=tu-client-id-de-google
GOOGLE_CLIENT_SECRET=tu-client-secret-de-google
```

Las credenciales de Google se configuran en [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

### 4. Configurar Prisma

```bash
npx prisma generate --schema apps/web/prisma/schema.prisma
npx prisma migrate dev --schema apps/web/prisma/schema.prisma
```

El primero genera los tipos TypeScript. El segundo aplica las migraciones a la base de datos.

### 5. Arrancar el proyecto

```bash
pnpm dev
```

Abre http://localhost:3000 — la app web corre en el puerto 3000.

## Comandos utiles

| Comando | Que hace |
|---------|----------|
| `pnpm dev` | Arranca todos los dev servers |
| `pnpm build` | Compila todo el monorepo |
| `pnpm lint` | Linter (cero warnings) |
| `pnpm check-types` | Verificar tipos TypeScript |
| `docker compose up -d` | Levantar PostgreSQL |
| `docker compose down` | Parar PostgreSQL |

## Estructura del monorepo

```
apps/web    — App principal (Next.js 16, React 19)
apps/docs   — Documentacion (Next.js)
packages/ui — Componentes compartidos
docs/       — Apuntes y documentacion del proyecto (Obsidian)
```

## Notas por SO

- **Linux**: nvm viene en la terminal directamente
- **Windows**: usa [nvm-windows](https://github.com/coreybutler/nvm-windows) para gestionar versiones de Node. Docker Desktop para los contenedores
