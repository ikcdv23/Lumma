# Handoff — actualizado 2026-04-30

> Documento para retomar el trabajo en otra maquina o despues de un break. Lee esto **primero**.

## Resumen del progreso

Sesion 2026-04-28 (anterior):
- Auth con password (Zod, bcrypt, useActionState)
- UI de carpetas pulida (icono, hover, breadcrumbs)
- Esqueleto UI de notas
- Mockups del nuevo `/home` (V1, V2, V3, V4)
- Decision: **carpeta Inbox especial** (LUEGO REVERTIDA, ver abajo)

Sesiones 2026-04-29 y 2026-04-30 (esta):
- Reversion de la decision Inbox: ahora es **vista virtual** (no entidad DB)
- Implementacion del campo `isQuickNote` para distinguir quick notes de notas sin carpeta
- `/home` real con FastNotes + folder pills + Inbox pill
- `/inbox` creada con listado de quick notes
- Sidebar actualizado con pestaña Inbox
- Despliegue a producci0n configurado (Vercel + Neon)
- Discutida estrategia de autosave (pendiente de implementar)

---

## Decision arquitectonica importante: Inbox como vista virtual

**Reversion respecto al handoff anterior**.

Inbox **NO es una entidad** (ni Folder especial, ni nada en DB). Es una **vista virtual** = filtro `WHERE isQuickNote = true`.

### Distincion clave

Una **quick note** y una **nota sin carpeta** son cosas distintas conceptualmente, aunque ambas tengan `folderId: null`:

- **Quick note**: el usuario la crea sin pensar (captura rapida), pendiente de revisar/organizar. `isQuickNote: true`
- **Nota sin carpeta intencional**: el usuario decidio no clasificarla. `isQuickNote: false` y `folderId: null`

Esta distincion es **solo en la cabeza del usuario** — en DB son notas con campos distintos en una sola tabla (Single Table Inheritance).

### Schema actual (Note)

```prisma
model Note {
  id                  String    @id @default(uuid())
  title               String
  content             Json      @default("{}")
  isQuickNote         Boolean   @default(false)
  autoDeleteAfterDays Int?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  folder              Folder?   @relation(fields: [folderId], references: [id], onDelete: SetNull)
  folderId            String?
  user                User      @relation(fields: [userId], references: [id])
  userId              String
}
```

Decisiones tomadas:
- `content` con default `{}` para evitar errores al crear notas vacias
- `folder onDelete: SetNull`: si borras una carpeta, sus notas se vuelven sin carpeta (no se borran)
- `isQuickNote` boolean para distinguir Inbox vs sin carpeta
- `autoDeleteAfterDays`: campo per-nota para auto-delete (UI/logica pendiente)

### Migraciones aplicadas (orden)

1. `20260428061216_add_password_field`
2. `20260428114737_add_default_content_to_notes` (mal nombrada, en realidad puso default a `title`)
3. `20260429064104_fix_note_content_default`
4. `20260429103546_folder_delete_set_null`
5. `20260430112144_quick_notes_implement` (añadio `isQuickNote` y `autoDeleteAfterDays`)

---

## Estado actual de la app

### ✅ Funciona

- Registro con email/password (Zod + bcrypt)
- Login con email/password (NextAuth Credentials, JWT sessions)
- Login con Google OAuth
- CRUD de carpetas (crear, editar, eliminar, listar)
- Pagina dentro de carpeta (`/folders/[folderId]`) con breadcrumbs
- **Pagina `/home`** con: saludo + tarjeta Nota Rapida (animacion expand-to-fullscreen) + pildora Inbox + pildoras de carpetas reales
- **Pagina `/inbox`** lista las quick notes
- Sidebar con: Inicio | Inbox | Carpetas
- Despliegue en Vercel + DB en Neon

### ⚠️ A medias / parcialmente conectado

- **FastNotes (`fast-note-card.tsx`)**: tiene la animacion V4 pero **sin logica de guardado**. El boton "Guardar" no hace nada, el titulo es uncontrolled, no hay autosave.
- **`/home`**: muestra folders reales y conteo Inbox real, pero el componente FastNotes no esta conectado.
- **`note-card.tsx` y `note-modal.tsx`**: TODOs sin conectar a server actions.
- **Editor de nota individual** (`/folders/[folderId]/[noteId]`): no existe todavia.
- **`autoDeleteAfterDays`**: campo añadido al schema pero ninguna logica usa el valor aun.

### ❌ Sin empezar

- Editor de nota completo (rich text, autosave, etc.)
- Verificacion por email (Mailtrap, sigue en plan `auth-with-password.md`)
- Logica de "promocion": cuando se mueve una quick note a una carpeta, debe hacerse `isQuickNote: false`
- Auto-delete de quick notes pasados X dias (cron o check on read)
- Vista "Sin clasificar" (notas con `isQuickNote: false` y `folderId: null`)

---

## Siguiente paso pactado: AUTOSAVE en FastNotes

Javier quiere implementarlo el mismo. Va a hacerlo en el componente `components/notes/fast-note-card.tsx`.

### Estado actual del componente

- Tiene state local: `isExpanded`, `noteText`
- El input del titulo es **uncontrolled** (no useState, no value, no onChange)
- El textarea esta controlled pero no se guarda en ningun sitio
- No existe `noteId` ni `saveStatus`

### Plan que hablamos para el autosave

1. Pieza 1 — Anadir `useState` para `title` y hacerlo controlled
2. Pieza 2 — Anadir `useState` para `noteId` (null inicialmente, se rellena tras el primer save)
3. Pieza 3 — Anadir `useState` para `saveStatus` (`"idle" | "saving" | "saved"`)
4. Pieza 4 — `useEffect` con debounce de 1000ms que mira `title` y `noteText`:
   - Si no hay `noteId`, llama a una nueva version de `createQuickNote(title, content)` y guarda el id
   - Si ya hay `noteId`, llama a `updateNote(noteId, { title, content })`
5. Pieza 5 — Adaptar `createQuickNote` para que acepte `title` y `content` como parametros (ahora no recibe nada, pone "Nota rapida N" auto-numerada). Decision: que use lo que el usuario escriba.

### Conceptos clave del debounce con useEffect

```tsx
useEffect(() => {
  setSaveStatus("saving");
  const timer = setTimeout(async () => {
    // guardar
    setSaveStatus("saved");
  }, 1000);
  return () => clearTimeout(timer);  // cancela timer si el efecto se re-ejecuta
}, [title, noteText]);
```

El `clearTimeout` en el cleanup es lo que hace que mientras el usuario sigue tecleando se reinicie el contador.

### Race conditions (heads up para mas adelante)

Si el usuario teclea rapido pueden solaparse 2 saves. Para una primera version se puede ignorar. Para version robusta, usar `AbortController` o desestimar respuestas obsoletas.

---

## Archivos clave creados/modificados desde el handoff anterior

### Schema y migraciones

- `prisma/schema.prisma`:
  - Note: `content @default("{}")`, `isQuickNote Boolean @default(false)`, `autoDeleteAfterDays Int?`
  - Note.folder: `onDelete: SetNull` (era Cascade implicito)
- 3 migraciones nuevas (ver lista arriba)

### Server actions (`server/actions/notes-actions.ts`)

- `createQuickNote()`: crea con titulo auto-numerado "Nota rapida N", `isQuickNote: true`, `folderId: null`
- `getInboxCount()`: cuenta notas con `isQuickNote: true` (cambio: antes contaba `folderId: null`)
- `getInboxNotes()`: lista quick notes ordenadas por `updatedAt desc`
- `getRecentNotes(limit)`: notas recientes con info de folder

### Componentes nuevos

- `components/folders/folder-pill.tsx`: chip estilo pildora para carpetas (en home). **Bug fix**: `href` apuntaba a `/notes/${idFolder}` (ruta inexistente), corregido a `/folders/${idFolder}`.
- `components/notes/fast-note-card.tsx`: V4 mockup adaptado al home, con animacion layoutId. Sin logica todavia.
- `app/(workspace)/home/home-client.tsx`: **archivo huerfano**, no se usa en `home/page.tsx`. Es residuo de cuando se planeaba separar Server/Client. Se puede borrar.

### Paginas

- `app/(workspace)/home/page.tsx`: usa `FastNotes` + Inbox pill + folder pills reales
- `app/(workspace)/inbox/page.tsx`: lista de quick notes, estado vacio decente
- `app/(workspace)/layout.tsx`: añadido enlace Inbox al sidebar

### Mockups (datos referencia)

- `app/(workspace)/mockups/v1/page.tsx`, `v2`, `v3`, `v4`
- `app/(workspace)/home/mock-data.ts` (compartido por los mockups via path relativo)

### Despliegue (NUEVO en esta sesion)

- **Hosting**: Vercel (https://lumma-web.vercel.app)
- **DB produccion**: Neon (PostgreSQL serverless)
- **Variables**: configuradas en Vercel → Settings → Environment Variables
- **NEXTAUTH_SECRET → AUTH_SECRET**: NextAuth v5 cambio el nombre de la variable

#### Workflow de migraciones a Neon

Cuando hay migraciones pendientes que aplicar a produccion (antes de pushear):

1. En `apps/web/.env`, comentar `DATABASE_URL` de Docker y descomentar la de Neon
2. `cd apps/web && pnpm prisma migrate deploy`
3. Revertir `.env`
4. Ya se puede pushear; Vercel detecta y despliega solo

---

## Convenciones / lecciones aprendidas

### React/Next.js

- **Server Components por defecto**, `"use client"` solo cuando necesitas hooks/eventos
- **Patron Server + Client**: pagina como Server Component, partes interactivas en Client Components
- **`useActionState`** para conectar forms con server actions cuando se necesita mostrar errores (con firma `(prevState, formData)`)
- **Type narrowing**: `if (!session?.user?.id) return;` permite a TypeScript saber que no es undefined despues
- **`asChild`** en componentes Shadcn cuando quieres que el hijo (Link, button) sea el elemento real

### Prisma

- **Filtrar por `userId`** en TODAS las queries para seguridad
- **Regenerar cliente** despues de cambios en schema: `pnpm prisma generate` (a veces `migrate dev` no lo hace solo, hay que reiniciar TS server tambien)
- **Single Table Inheritance**: cuando entidades comparten >70% de comportamiento, una sola tabla con campo discriminador (es lo que hicimos con `isQuickNote`)
- `onDelete: SetNull` en relaciones cuando borrar el padre no implica borrar al hijo

### Diseno UX

- **Inbox como vista virtual** > Inbox como entidad: mas simple, sin edge cases (crear al signup, prevenir borrado, etc.)
- **`folderId: null + isQuickNote`** distingue intenciones del usuario sin complicar el schema
- **Componentes solo se reutilizan si comparten >70% comportamiento**, no solo apariencia. La pildora del Inbox **NO** usa FolderPill porque cambian icono, href y semantica.

### Bugs corregidos

- `revalidatePath("/notes")` y `"/ folders"` (con espacio) → `/folders`
- `import constants from "node:constants"` (basura por autocompletado)
- `String` (mayuscula) vs `string` (primitivo)
- `formData.get(confirmPass)` sin comillas
- `onChange={(e) => setEmail(...)}` en input de password (copy-paste en register-form)
- Logica invertida en validacion (`confirmPass` truthy en vez de `!confirmPass`)
- **NUEVO**: `FolderPill` apuntaba a `/notes/${idFolder}` (ruta inexistente)
- **NUEVO**: `getInboxCount` filtraba `folderId: null` (incluia notas sin carpeta no-quick)

---

## TODOs concretos en codigo

### `components/notes/fast-note-card.tsx`
- Sin logica de guardado. Pendiente: autosave (siguiente paso, lo hace Javier).

### `components/notes/note-card.tsx`
- Linea ~50: `// TODO: llamar a deleteNote(idNote)`

### `components/notes/note-modal.tsx`
Funcion `handleSave`:
```tsx
// TODO: si isEditing → updateNote(note.id, { title })
// TODO: si NO isEditing → createNote(folderId, title)
```

### `app/(workspace)/home/home-client.tsx`
- Archivo huerfano. **Decidir**: borrar o usar.

---

## Comandos utiles

```bash
# Levantar todo (desde raiz)
pnpm dev

# Migracion despues de cambiar schema (desde apps/web/)
pnpm prisma migrate dev --name nombre-descriptivo

# Regenerar cliente Prisma manualmente (si migrate no lo hace)
pnpm prisma generate

# Aplicar migraciones a Neon en produccion (con .env apuntando a Neon)
pnpm prisma migrate deploy

# Ver/editar DB visualmente
pnpm prisma studio

# Verificar tipos
pnpm check-types

# Levantar BD (Docker)
docker compose up -d
```

---

## Donde retomar (siguiente sesion)

Por orden de prioridad:

1. **Autosave en FastNotes** (lo escribira Javier, segun plan arriba) — incluir adaptar `createQuickNote` a recibir title/content
2. **Borrar `home-client.tsx`** si ya no se usa
3. **Conectar TODOs** de `note-card.tsx` y `note-modal.tsx`
4. **Logica de promocion**: al mover quick note a folder, marcar `isQuickNote: false`
5. **Editor de nota individual** (`/folders/[folderId]/[noteId]/page.tsx`)
6. Vista "Sin clasificar" (filtro `isQuickNote: false AND folderId: null`)
7. Auto-delete de quick notes (cron o filtro on read)

---

## Notas sobre el flujo de trabajo

Javier quiere:

- **Aprender, no que escriba codigo por el** — explica antes de tocar archivos
- **Para UI/diseño esta OK que el AI escriba codigo**, para LOGICA el lo implementa
- **Ir paso a paso** — un cambio a la vez
- **Verificar antes de dar feedback** — leer el archivo real, no asumir
- **Respuestas directas, sin trailing summaries, sin emojis**
- **Idioma**: español
- **Prefiere preguntar el "por que"** y entender los principios subyacentes (ej: pidio mas detalle sobre Single Table Inheritance, debounce, etc.)
