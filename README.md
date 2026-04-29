# Lumma

App de notas para estudiantes y productividad.

## Requisitos

- **Node.js** >= 20.19 (`nvm install 20 && nvm use 20`)
- **pnpm** 9 (`npm install --global corepack@latest && corepack enable`)
- **Docker** (para PostgreSQL en local)

## Setup desde cero

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repo>
cd Lumma
pnpm install
```

### 2. Levantar la base de datos local

```bash
docker compose up -d
```

PostgreSQL 16 en el puerto 5432 con usuario `lumma`, password `lumma123`, base de datos `lumma`.

### 3. Variables de entorno

Crea el archivo `apps/web/.env.local`:

```env
DATABASE_URL="postgresql://lumma:lumma123@localhost:5432/lumma"
AUTH_SECRET="cualquier-string-secreto-aqui"
GOOGLE_CLIENT_ID="tu-client-id-de-google"
GOOGLE_CLIENT_SECRET="tu-client-secret-de-google"
```

Las credenciales de Google se configuran en [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

Para `AUTH_SECRET` puedes generar uno con:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

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

Aplica la migración a Docker local y genera el archivo `.sql` en `prisma/migrations/`.

### Antes de hacer push (si hay migraciones nuevas)

Hay que aplicarlas a Neon (la BD de producción) ANTES de pushear:

1. Editar `apps/web/.env`:
   - Comentar `DATABASE_URL` de Docker
   - Descomentar la `DATABASE_URL` de Neon
2. Ejecutar:
   ```bash
   cd apps/web
   pnpm prisma migrate deploy
   ```
3. Revertir `.env` (descomentar Docker, comentar Neon)

### Push

```bash
git push
```

Vercel detecta el push y despliega automáticamente. Si la rama es la conectada a producción, la app se actualiza sola.

## Producción

- **Hosting:** Vercel (https://lumma-web.vercel.app)
- **Base de datos:** Neon (PostgreSQL serverless)
- **Auth:** NextAuth.js con Google OAuth + Credentials

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

## Estructura del monorepo

```
apps/web    — App principal (Next.js 16, React 19)
apps/docs   — Documentación (Next.js)
packages/ui — Componentes compartidos
docs/       — Apuntes y documentación del proyecto (Obsidian)
```

## Notas por SO

- **Linux**: nvm viene en la terminal directamente
- **Windows**: usa [nvm-windows](https://github.com/coreybutler/nvm-windows) para gestionar versiones de Node. Docker Desktop para los contenedores
