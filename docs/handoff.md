# Handoff — actualizado 2026-05-04 (final del dia)

> Documento para retomar el trabajo en otra maquina o despues de un break. Lee esto **primero**.

## Resumen del progreso

Sesion 2026-04-28: Auth con password, UI carpetas pulida, esqueleto notas, mockups del home

Sesiones 2026-04-29 / 2026-04-30:
- Inbox como vista virtual
- `/home` real con FastNotes + folder pills + Inbox pill
- `/inbox` creada
- Despliegue a produccion (Vercel + Neon)

Sesiones 2026-05-01 a 2026-05-03:
- Autosave en FastNotes completado con debounce
- Editor BlockNote parcial
- `NewNoteButton` y `SaveFolderButton` extraidos con `useFormStatus`
- `FolderModal` refactorizado a `<form action>`

Sesion 2026-05-04 (HOY):
- **Feature de feedback completa** (foro de comunidad con votos y estrellas)
- Sidebar reorganizado (Feedback movido al footer)
- Widths estandarizados a `max-w-5xl` en todas las paginas
- Lección aprendida sobre `useFormStatus` (debe estar DENTRO del form)
- **Reflexión estratégica**: descubierto competidor casi idéntico (lumanote.org)
- **Decisión pendiente**: rebrand de Lumma o seguir como proyecto de aprendizaje

---

## NUEVA: Feature de feedback (community board)

Sistema de posts tipo foro/Canny.io donde usuarios logueados:
- Crean posts con texto + rating (1-5 estrellas)
- Votan posts de otros (toggle, 1 voto por usuario por post)
- Borran sus propios posts
- NO se pueden editar (decision tomada por simplicidad)
- NO hay comentarios anidados (decision tomada para mantener simple)

### Schema

```prisma
model FeedbackPost {
  id        String         @id @default(uuid())
  content   String
  rating    Int                              // 1-5
  edited    Boolean        @default(false)   // CANDIDATO A BORRAR (no se edita)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt        // CANDIDATO A BORRAR (no se actualiza)
  author    User           @relation(fields: [authorId], references: [id])
  authorId  String
  votes     FeedbackVote[]
}

model FeedbackVote {
  user      User         @relation(fields: [userId], references: [id])
  userId    String
  post      FeedbackPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    String

  @@id([userId, postId])  // un usuario solo puede votar 1 vez por post
}
```

### Server actions (`server/actions/feedback-actions.ts`)

```typescript
createFeedbackPost(content: string, rating: number)
deleteFeedbackPost(postId: string)
getFeedbackPosts()                    // ordena por createdAt desc, incluye _count.votes y si tu votaste
toggleFeedbackVote(postId: string)    // crea o borra segun exista
```

### Componentes nuevos

- `components/feedback/star-rating.tsx` — 5 estrellas, modos interactivo (con onChange + hover preview) y readonly. Acepta `size`.
- `components/feedback/vote-button.tsx` — Cápsula con corazón y contador. Usa `useFormStatus` + `motion`/`AnimatePresence` para animar el toggle.
- `components/feedback/feedback-post-card.tsx` — Card del post con autor, fecha relativa, estrellas readonly, contenido, vote button, botón de eliminar (solo autor). Server Component que usa inline server actions.
- `components/feedback/feedback-form.tsx` — Form con textarea + StarRating + submit button. Estado local de content y rating. Bloqueado hasta tener ambos.

### Página

- `app/(workspace)/feedback/page.tsx` — Header con icono + descripción + form + lista de posts (o estado vacío)

### Sidebar

- Link "Feedback" movido del nav principal al **footer**, encima del usuario
- Razón: feedback no es parte del flujo de estudio. Tener "leer comentarios" como item primario distrae cuando el usuario quiere estudiar

---

## Decisión arquitectónica vigente: Inbox como vista virtual

Inbox **NO es entidad**. Es filtro `WHERE folderId = null`.

### Schema actual (Note)

```prisma
model Note {
  id                  String    @id @default(uuid())
  title               String
  content             Json      @default("{}")
  isQuickNote         Boolean   @default(false)   // NO USADO, candidato a borrar
  autoDeleteAfterDays Int?                         // NO USADO, candidato a borrar
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  folder              Folder?   @relation(fields: [folderId], references: [id], onDelete: SetNull)
  folderId            String?
  user                User      @relation(fields: [userId], references: [id])
  userId              String
}
```

### Migraciones aplicadas

1. `add_password_field`
2. `add_default_content_to_notes`
3. `fix_note_content_default`
4. `folder_delete_set_null`
5. `quick_notes_implement` (añadio isQuickNote y autoDeleteAfterDays — ahora son legacy)
6. `add_feedback_forum` (FeedbackPost + FeedbackVote)
7. `remove_feedback_unused_fields` (limpieza, NO confundir con la pendiente)

---

## Estado actual de la app

### ✅ Funciona

- Auth con password (Zod + bcrypt) y Google OAuth
- CRUD completo de carpetas (con `SaveFolderButton` y loading state)
- CRUD basico de notas
- `/home` con FastNotes (autosave funcional), Inbox pill, folder pills, notas recientes
- `/inbox` lista quick notes
- `/folders` y `/folders/[folderId]` con breadcrumbs
- `/notes/[noteId]` editor con BlockNote (parcial pero usable)
- `/feedback` foro completo con votos y estrellas (NUEVO HOY)
- Despliegue Vercel + Neon

### ❌ Sin empezar

- Rate limiting en server actions (CRÍTICO si abres a usuarios reales)
- Validación con Zod en `createFeedbackPost` (rating fuera de 1-5, content sin maxLength server-side)
- Verificación email con Mailtrap (plan en `auth-with-password.md`)
- Auto-delete de notas (campo añadido pero sin lógica)
- Página de perfil del usuario (`/profile`) — no existe, el bloque del footer es decorativo

---

## Patron establecido: Botones submit con loading state

**Lección clave**: `useFormStatus` SOLO funciona DENTRO de un `<form>`. Si lo metes en el componente padre que contiene el form, siempre devuelve `pending: false`.

### Solución: extraer botones a componentes propios

Ejemplos en proyecto:
- `components/notes/new-note-button.tsx`
- `components/folders/save-folder-button.tsx`
- `components/feedback/vote-button.tsx`

### Patrón

```tsx
"use client";
import { useFormStatus } from "react-dom";

export function MyButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Icon />}
      {pending ? "Cargando..." : "Texto"}
    </Button>
  );
}
```

Y se usa siempre dentro de `<form action={...}>`. **SRP aplicado**: cada componente tiene UNA responsabilidad.

### Donde aplicar/no aplicar

- ✅ Botones que disparan server actions (crear, guardar, votar)
- ❌ Botones que solo abren modales (acción instantánea, no necesitan loading)
- ❌ FastNotes "Guardar" — eliminado porque hay autosave

---

## Bugs encontrados HOY

### 1. Prisma client cache después de migrar

Después de aplicar migración (`add_feedback_forum`), `prisma.feedbackPost` era `undefined` en runtime aunque los tipos generados estaban bien. **Causa**: `lib/prisma.ts` cachea la instancia en `globalThis` en dev. El `pnpm dev` que estaba corriendo seguía con la instancia vieja en memoria.

**Fix**: matar el dev server (`Ctrl+C`) y arrancar fresco con `pnpm dev`. NO basta con guardar archivo — el cache vive a nivel de módulo Node.

**Lección**: cuando cambias schema o regeneras cliente Prisma, **siempre** reinicia dev server.

### 2. Vercel build fallaba por column inexistente

Tipo error: `Invalid prisma.note.count() invocation: The column 'Note.isQuickNote' does not exist`. Causa: aplicaste migración a Docker pero NO a Neon. Vercel deployó código que esperaba columnas que en Neon no existían.

**Workflow recordatorio**:
1. Editar schema
2. `pnpm prisma migrate dev --name X` (aplica a Docker)
3. **ANTES de pushear**: cambiar `.env` a Neon, `pnpm prisma migrate deploy`, revertir `.env`
4. Push

### 3. Hydration warning en Sidebar

Causa: combinación Radix `Slot` + Next `<Link>` + `asChild` produce mismatch SSR/cliente. Conocido. **No tiene fix limpio**, decidimos aceptar el warning (es recoverable, solo en dev console, no afecta producción).

---

## REFLEXIÓN ESTRATÉGICA: descubierto competidor (HOY)

### El descubrimiento

Javier encontró **lumanote.org** — una app de notas con:
- Pomodoro / Focus Timer (25m, 50m, 10m presets)
- Deep Focus Mode (= Zen Mode)
- AI Flashcards desde notas
- Practice quizzes
- Exam summaries
- Posicionada **"For Students"** explícitamente
- 10k+ usuarios activos según landing
- Inglés, mercado angloparlante

**Tiene exactamente** lo que Lumma planeaba en su roadmap. Es esencialmente el mismo producto.

### Honesta lectura

El roadmap de Lumma (Pomodoro + Zen Mode + flashcards + estudiantes) tiene poca diferenciación frente a Luma. Los diferenciadores que quedan son débiles individualmente:
- Idioma español (no es defensible si Luma decide localizar)
- Bóveda privada (es un feature, lo añaden en una semana)
- Open source (no es ventaja para 99% de usuarios)

### Naming problem

**"Lumma" vs "Luma"** — fonéticamente idénticos. Para SEO, brand recognition, etc. competir con un nombre tan parecido es perder. Si Lumma fuese un proyecto comercial, **rebrand sería casi obligatorio**.

Para proyecto de aprendizaje (que es lo que es), el daño es solo emocional. Funcionalmente no afecta.

Javier había planeado llamar al asistente IA **"Luminita"** — diminutivo en español, "lucecita". Buen branding. Sobrevive al rebrand del producto principal porque no depende del nombre Lumma.

### Decisión pendiente (Javier debe meditar)

3 opciones discutidas:

**A. Continuar como proyecto de aprendizaje sin pretensión comercial**
- Lumma es portfolio, sandbox para aprender. Sin presión de competir.
- Mantener nombre Lumma sin estrés.
- Esto no se decide aún pero es la opción menos disruptiva.

**B. Pivot radical de nicho**
- Salir del mercado "app de notas para estudiantes generales" (océano rojo).
- Buscar nicho más cerrado: estudiantes de medicina, opositores españoles, etc.
- Implica replantear features y mensaje.

**C. Abandonar y empezar algo nuevo**
- Canalizar todo lo aprendido en una idea propia, no copia.
- Lumma queda como portfolio cerrado.

Mi recomendación a Javier: **opción A**. Sigue construyendo Lumma como aprendizaje sin pretender competir. Cuando tengas una idea original donde TÚ descubres el problema, le aplicas todo lo aprendido aquí.

### Lo que Javier NO ha perdido

- Experiencia técnica acumulada (auth, Prisma, Next.js avanzado, deploy, decisiones de producto)
- Proyecto funcional en portfolio
- Proceso de tomar decisiones de UX
- Lección de "encontrar competidor" — vivencia real de mercado

---

## Convenciones / lecciones aprendidas

### React/Next.js

- Server Components por defecto, `"use client"` solo cuando necesitas hooks/eventos
- **Patron Server + Client**: pagina como Server Component, partes interactivas en Client Components
- **`useActionState`** para errores en forms (firma `(prevState, formData)`)
- **`useFormStatus`** SOLO funciona DENTRO de un `<form>` — extrae el botón a componente propio
- **Type narrowing**: `if (!session?.user?.id) return;` permite a TS saber que no es undefined
- **`asChild`** en Shadcn cuando quieres que el hijo (Link, button) sea el elemento real
- **Debounce con `useEffect` + `setTimeout` + cleanup `clearTimeout`**: para autosave o acciones que se reinician mientras el usuario sigue activo

### Prisma

- **Filtrar por `userId`** en TODAS las queries (seguridad)
- **Regenerar cliente** después de schema: `pnpm prisma generate` (a veces `migrate dev` no lo hace, y reiniciar TS server)
- **Reiniciar dev server después de regenerar cliente** (cache en globalThis)
- `onDelete: SetNull` en relaciones cuando borrar el padre no implica borrar al hijo
- **Single Table Inheritance**: cuando entidades comparten >70% comportamiento, una sola tabla con campo discriminador

### Diseño UX

- **Inbox como vista virtual** > Inbox como entidad
- **Componentes solo se reutilizan si comparten >70% comportamiento**, no solo apariencia
- **Autosave > botón Guardar**: si guardas automáticamente, no hace falta botón. Solo indicador.
- **Escape para cerrar modales**: detalle pulido esperado por power users
- **Feedback en footer del sidebar**: lo no-prioritario fuera del flujo principal

### YAGNI

- Si añades campos al schema "por si acaso" pero nunca los usas, **bórralos**. Migrar es trivial.
- Si propones una prop a un componente porque "podría hacer falta" pero no la usas, **NO la añadas**. (Lección de `variant` en NewNoteButton)

### Bugs corregidos histórico

- `revalidatePath("/notes")` y `"/ folders"` (con espacio) → `/folders`
- `import constants from "node:constants"` (basura por autocompletado)
- `String` (mayúscula) vs `string` (primitivo)
- `formData.get(confirmPass)` sin comillas
- Lógica invertida en validación
- `FolderPill` apuntaba a `/notes/${idFolder}` → `/folders/${idFolder}`
- `getInboxCount` filtraba `folderId: null` (problema cuando se intentó usar `isQuickNote`)
- `useFormStatus` en componente padre del form (siempre `pending: false`)
- Prisma client cache en dev tras migración

---

## Comandos útiles

```bash
# Levantar todo (desde raiz)
pnpm dev

# Migración después de cambiar schema (desde apps/web/)
pnpm prisma migrate dev --name nombre-descriptivo

# Regenerar cliente Prisma manualmente
pnpm prisma generate

# Aplicar migraciones a Neon en producción (con .env apuntando a Neon)
pnpm prisma migrate deploy

# Ver/editar DB visualmente
pnpm prisma studio

# Verificar tipos
pnpm check-types

# Levantar BD (Docker)
docker compose up -d
```

---

## Donde retomar (siguiente sesión)

Por orden de prioridad:

1. **Decisión sobre Lumma**: continuar como aprendizaje, pivotar nicho, o abandonar (Javier debe decidir)
2. **Decisión sobre rebrand**: cambiar de "Lumma" a otro nombre por el conflicto con Luma (relacionado con punto 1)
3. **Cleanup schema**: eliminar `isQuickNote`, `autoDeleteAfterDays`, `edited`, `updatedAt` de FeedbackPost. Migración local + Neon.
4. **Cleanup código**: borrar `home-client.tsx` huerfano, mockups si ya no sirven
5. **Validación con Zod en feedback-actions** (rating 1-5, content max 2000 chars server-side)
6. **Rate limiting** en server actions (CRÍTICO antes de abrir a más usuarios)
7. Verificación email con Mailtrap
8. Página de perfil

---

## Notas sobre el flujo de trabajo

Javier quiere:

- **Aprender, no que el AI escriba código por él** — explicar antes de tocar archivos
- **Para UI/diseño está OK que el AI escriba código**, para LÓGICA él lo implementa
- **Ir paso a paso** — un cambio a la vez
- **Verificar antes de dar feedback** — leer el archivo real, no asumir
- **No añadir features extra que no se piden**
- **Respuestas directas, sin trailing summaries, sin emojis**
- **Idioma**: español
- **Prefiere preguntar el "por qué"** y entender principios subyacentes (Single Table Inheritance, debounce, useFormStatus restrictions, YAGNI, SOLID/SRP, hydration mismatches, security testing)

---

## Aside: aprendizaje de pentesting (HOY)

Javier ayudó a un amigo a auditar su app (calorie-ai-jbrl.vercel.app) usando Postman. Aprendizajes que valen para Lumma:

- **OWASP Top 10**: IDOR, info disclosure, rate limiting
- **Setup de Postman con cookies** de NextAuth
- **Búsqueda de secrets en bundles JS** (Sources tab + Ctrl+Shift+F)
- **Wappalyzer** para reconocimiento de stack
- **Reportes profesionales** de bugs (severidad + repro + impacto + fix)

Esto refuerza la importancia de:
- Validar inputs server-side (no solo HTML5)
- Filtrar por `userId` siempre
- Mensajes de error neutros (no leak info)
- Rate limiting (Lumma NO lo tiene)
