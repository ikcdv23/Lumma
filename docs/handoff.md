# Handoff — sesion 2026-04-28

> Documento para retomar el trabajo en otra maquina o despues de un break. Lee esto **primero**.

## Resumen ejecutivo

Esta sesion se trabajo en:

1. Auth con password (Zod, bcrypt, useActionState, NextAuth Credentials provider)
2. UI de carpetas pulida (icono, hover, estado vacio, breadcrumbs)
3. Esqueleto UI de notas (NotesGrid, NoteCard, NoteModal) **sin logica conectada**
4. **Replanteamiento de la arquitectura UX** — decision: usar carpeta "Inbox" para quick notes
5. Mockups del nuevo `/home` listos para que Javier elija direccion

## Estado actual del codigo

### ✅ Funciona

- Registro con email/password (con Zod validacion + bcrypt hash)
- Login con email/password (NextAuth Credentials provider, JWT sessions)
- Login con Google (en cuanto tenga las credenciales en `.env.local`)
- CRUD de carpetas (crear, editar, eliminar, listar)
- Pagina dentro de carpeta (`/folders/[folderId]`) con breadcrumbs
- Navegacion via Link, sidebar persistente

### ⚠️ A medias

- Componentes de notas (`note-card`, `notes-grid`, `note-modal`) creados pero con **TODOs sin conectar** a las server actions. Las server actions ya existen.
- Ver seccion "TODOs pendientes en codigo" abajo.

### ❌ Sin empezar

- Editor de nota (pagina `[folderId]/[noteId]/page.tsx`)
- Implementacion de la carpeta Inbox especial (ver "Decision arquitectonica" abajo)
- Verificacion por email (Mailtrap, sigue en plan `auth-with-password.md`)

## Decision arquitectonica importante (NUEVA)

Despues de implementar carpetas y notas por separado, Javier se dio cuenta de que la UX no fluia bien. Discutimos varias opciones y **decidio**:

**Las quick notes existiran y se almacenaran en una carpeta especial llamada "Inbox"**.

### Razonamiento

- Mantiene la regla "toda nota tiene una carpeta" → schema simple, sin casos especiales
- Permite captura rapida sin friccion (no hay que elegir carpeta)
- Estilo Apple Notes / GTD / Bear (familiar para usuarios)
- El usuario puede mover de Inbox a otra carpeta cuando quiera organizar

### Lo que falta para implementarlo

1. **Schema**: añadir campo `isDefault Boolean @default(false)` al modelo `Folder`
2. **Migration**: aplicar el cambio
3. **Auth flow**: cuando se crea un usuario nuevo (Google OAuth o registro manual), crear automaticamente su carpeta "Inbox" con `isDefault: true`
4. **UI**: marcar visualmente la Inbox (icono `Inbox` de Lucide en vez de `Folder`, posicion fija arriba en el listado)
5. **Logica**: prevenir borrar la Inbox (la app la recreara si intentas)

## Mockups del nuevo `/home`

Hay 4 variantes de diseño en `app/(workspace)/mockups/`:

- `/mockups` — indice con descripciones de cada variante
- `/mockups/v1` — Dashboard con cards (saludo + quick capture grande + secciones de notas y carpetas)
- `/mockups/v2` — Productividad / 2 columnas (lista de notas a la izquierda, carpetas + captura a la derecha)
- `/mockups/v3` — Quick capture minimalista (input centrado tipo "que tienes en mente", chips de carpetas, lista de recientes)
- `/mockups/v4` — **ELEGIDA POR JAVIER** — V3 + animacion expand-to-fullscreen al click en la tarjeta de Nota rapida

**Datos hardcodeados** en `app/(workspace)/mockups/mock-data.ts`. Se pueden borrar cuando se decida la variante final.

### V4 - detalle tecnico

Javier eligio V4 como direccion final para `/home`. Caracteristicas:

- Misma estructura visual que V3 (saludo, chips de carpetas, lista de recientes)
- La tarjeta "Nota rapida" usa `layoutId` de `motion` (Framer Motion) para animar
- Click en la tarjeta → se expande a fullscreen ocupando casi toda la pantalla
- En fullscreen aparece un editor con titulo + textarea
- Backdrop con blur + click fuera/X para cerrar
- Hero/carpetas/recientes se desvanecen con opacity al expandir

**Libreria nueva instalada**: `motion` (sucesor de `framer-motion`).
```bash
pnpm add motion --filter web
```

Import: `import { motion, AnimatePresence } from "motion/react"`

### Conceptos clave de Framer Motion / motion

- **`layoutId`**: dos elementos con el mismo `layoutId` (en distintos momentos del DOM) se animan automaticamente entre sus estados. Aqui se usan tres: `quick-note` (card), `quick-note-header` (icono+titulo), `quick-note-placeholder` (texto)
- **`AnimatePresence`**: permite animar elementos que se montan/desmontan (entrada y salida)
- **`spring physics`**: `transition={{ type: "spring", damping: 28, stiffness: 220 }}` da el movimiento natural

### Que debe hacer Javier proximamente

1. Trasladar V4 al `/home` real (creando los componentes correspondientes)
2. Reemplazar la tarjeta hardcodeada por una funcional (con la action `createNote` cuando se guarde)
3. Reemplazar carpetas y notas mockeadas por datos reales de la DB

## TODOs pendientes en codigo

### `components/notes/note-card.tsx`

Linea ~50:
```tsx
onClick={() => {
    // TODO: llamar a deleteNote(idNote)
}}
```

### `components/notes/note-modal.tsx`

Funcion `handleSave`:
```tsx
async function handleSave() {
    // TODO: si isEditing → updateNote(note.id, { title })
    // TODO: si NO isEditing → createNote(folderId, title)
    setTitle("");
    onOpenChange(false);
}
```

Las server actions ya estan en `server/actions/notes-actions.ts` (createNote, updateNote, deleteNote, getNote).

## Archivos clave creados/modificados esta sesion

### Auth

- `auth.ts` — añadido Credentials provider + JWT strategy + callbacks para `id`
- `server/actions/auth-actions.ts` — `manualSignin` (registro) y `manualLogin` (login con AuthError handling)
- `schemas/auth.schema.ts` — registerSchema con Zod + refine para password match
- `components/auth/register-form.tsx` — Client Component con useState + controlled inputs
- `components/auth/login-form.tsx` — Client Component con `useActionState` para errores

### Carpetas (UI mejorada)

- `components/folders/folder-card.tsx` — icono, hover con elevacion, fecha pluralizada
- `components/folders/folder-grid.tsx` — header integrado con boton, estado vacio mejorado
- `app/(workspace)/folders/page.tsx` — simplificada (header vive en grid ahora)
- `app/(workspace)/folders/[folderId]/page.tsx` — breadcrumbs en vez de boton "Volver"

### Notas (esqueleto)

- `components/notes/note-card.tsx`
- `components/notes/notes-grid.tsx`
- `components/notes/note-modal.tsx`
- `server/actions/notes-actions.ts` — CRUD completo (createNote, getNote, updateNote, deleteNote)

### Mockups

- `app/(workspace)/mockups/page.tsx` — indice
- `app/(workspace)/mockups/mock-data.ts` — datos de ejemplo
- `app/(workspace)/mockups/v1/page.tsx`, `v2/page.tsx`, `v3/page.tsx`

### Schema

- `prisma/schema.prisma` — campo `password String?` añadido en User
- Migracion: `add_password_field`
- Tambien: `title String @default("")` en Note (migracion `add_default_content_to_notes`, mal nombrada — el cambio es en `title` no en `content`)

### Config

- `apps/web/tsconfig.json` — añadido `"declaration": false, "declarationMap": false` para evitar TS2742 con NextAuth
- `apps/web/.env` — creado (Prisma usa este, dotenv solo lee `.env`)
- `apps/web/.env.local` — sigue siendo el de Next.js
- `apps/web/.env.example` — plantilla para nuevas maquinas

## Convenciones aprendidas / aplicadas

### React/Next.js

- **Server Components por defecto**, `"use client"` solo cuando necesitas hooks/eventos
- **Patron Server + Client**: pagina como Server Component, partes interactivas extraidas a Client Components (ej: `FoldersGrid`, `RegisterForm`)
- **`useActionState`** para conectar forms con server actions cuando necesitas mostrar errores
- **`prevState: unknown`** primer parametro en actions usadas con `useActionState`
- **Type narrowing**: `if (!session?.user?.id) return;` permite a TypeScript saber que `id` no es undefined despues
- **`asChild`** en componentes Shadcn cuando quieres que el hijo (Link, button) sea el elemento real

### Prisma

- **Filtrar por `userId`** en TODAS las queries para seguridad (un usuario nunca debe ver datos de otro)
- **`include`** para traer relaciones (ej: `include: { notes: true }`)
- **Regenerar cliente** despues de cambios en schema: `npx prisma generate`

### Buenas practicas

- **Validar antes de tocar DB** (fail fast, ahorrar queries innecesarias)
- **Mensajes de error neutros** para evitar account enumeration (ver `docs/concepts/security-account-enumeration.md`)
- **Pluralizacion**: `${count} ${count === 1 ? "nota" : "notas"}`
- **`Intl.DateTimeFormat`** para fechas en español sin librerias externas

## Bugs que se corrigieron

- `revalidatePath("/notes")` y `revalidatePath("/ folders")` (con espacio) en `folder-actions.ts` → ahora `revalidatePath("/folders")`
- `import constants from "node:constants"` colado por autocompletado → eliminado
- `String` (mayuscula) vs `string` (primitivo) en type assertions
- `formData.get(confirmPass)` sin comillas → `formData.get("confirmPassword")`
- `onChange={(e) => setEmail(...)}` en input de password (copy-paste)
- Logica invertida en validacion: `confirmPass` truthy en vez de `!confirmPass`

## Comandos utiles

```bash
# Levantar todo (desde raiz)
pnpm dev

# Migracion despues de cambiar schema (desde apps/web/)
npx prisma migrate dev --name nombre-descriptivo

# Regenerar cliente Prisma (despues de migracion)
npx prisma generate

# Ver/editar DB visualmente
npx prisma studio

# Verificar tipos
pnpm check-types

# Levantar BD (Docker)
docker compose up -d
```

## Donde retomar

**Siguiente sesion deberia empezar por:**

1. Visitar `/mockups` y decidir variante para `/home`
2. Implementar la carpeta Inbox (schema + migration + creacion automatica al registrar usuario)
3. Conectar los TODOs de `note-card.tsx` y `note-modal.tsx`
4. Implementar el `/home` con la variante elegida
5. Editor de nota en `[folderId]/[noteId]/page.tsx` (mas adelante, es un mundo aparte: rich text, autosave, etc.)

## Notas sobre el flujo de trabajo

Javier quiere:

- **Aprender, no que escriba codigo por el** — explica antes de tocar archivos
- **Ir paso a paso** — un cambio a la vez, no propuestas masivas
- **Verificar antes de dar feedback** — leer el archivo real, no asumir lo que tiene
- **Respetar el estilo de respuesta**: directo, sin trailing summaries, sin emojis
- Para UI/diseño esta OK que escribas codigo (es el "responsable de UI"), pero para logica el quiere implementarla
- Idioma: español
