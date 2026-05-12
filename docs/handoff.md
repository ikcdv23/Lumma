# Handoff — actualizado 2026-05-11 (final del dia)

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

Sesion 2026-05-04:
- Feature de feedback completa (foro de comunidad con votos y estrellas)
- Sidebar reorganizado (Feedback movido al footer)
- Widths estandarizados a `max-w-5xl`
- Lección: `useFormStatus` debe estar DENTRO del form
- Descubierto competidor casi idéntico (lumanote.org). Decisión sobre rebrand pendiente

Sesion 2026-05-05:
- Página de **perfil** completa (`/profile`)
- Discusión y plan de Sessions/Solarium replanteado (de "Zen Mode" a "Sessions con IA + streak")
- Idea de admin dashboard documentada (post-MVP)
- Validación Zod en feedback aceptada como manual (low-risk)

Sesion 2026-05-06:
- **Solarium completamente diseñado** — la sección de herramientas de estudio. Mockup construido en `/sessions-mockup` con 5 pantallas
- **Sistema de marca anclado**: Lumma (luz) + Luminita (IA) + clima en calendario
- **Schema StudySession** diseñado y aplicado en `schema.prisma`
- **Routing decidido**: `/solarium` en (workspace), `/active` en (solariumspace)
- **Plan de implementación en 7 fases**
- Bug del sidebar (empty `<li>` tras revalidatePath) → arreglado

Sesion 2026-05-07:
- Solarium pusheado a `dev` por error (rompía deploy de Vercel)
- Resuelto con: nueva rama `feature/solarium` preservada en remoto + `git revert 0344867` en dev → commit `59f0d8e` deshace cambios
- Editor BlockNote pulido: color claro en lugar de negro, selector de lenguaje estilo "pill" arriba a la derecha, Shiki con 14 lenguajes (TypeScript, JavaScript, Python, Java, C, C++, C#, PHP, Bash, JSON, CSS, HTML, SQL, Markdown)
- Note detail más ancho (`max-w-3xl` → `max-w-4xl`)
- **NoteActionsMenu + MoveToFolderDialog**: kebab menu en nota detalle y filas de inbox/home, con "Mover a carpeta" + "Eliminar"
- Discusión sobre logo profesional (pendiente)
- Intento de desactivar spellcheck en code blocks → causó loop infinito con ProseMirror → revertido. Decisión: aceptar squigglies por ahora ("opción C")

Sesion 2026-05-08:
- **Fase 2 cerrada**: Server actions de Solarium completas en `server/actions/solarium-actions.ts`
  - `createSession`, `heartbeat`, `abandonSession`, `completeSession`, `getActiveSession` (con lazy-cleanup), `getRecentSessions`, `getStreak` (con gracia de 1 día)
- Schema StudySession enriquecido con campo `title` (default computado: "Sesión del {fecha en español}")
- Aprendizaje: `String` con mayúscula es la clase wrapper de JS (mal), `string` minúscula es el tipo TS (bien)
- Conceptos didácticos cubiertos: heartbeat (3 capas defensivas), `updateMany` vs `update` para no lanzar errores, `aggregate` con `_sum`, lazy cleanup como alternativa a cron jobs

Sesion 2026-05-11 (HOY):
- **Fase 3 estética cerrada**: Hub `/solarium` con visual del mockup (mock data, TODOs marcados para enchufar server actions)
- **Componentes Sky extraídos** a `components/solarium/sky/`:
  - `sky-night.tsx` (0 min) — predawn con luna y estrellas
  - `sky-dawn.tsx` (1-30%) — amanece con sol naranja asomando
  - `sky-morning.tsx` (30-75%) — paleta amber clásica, sol subiendo
  - `sky-midday.tsx` (75%+) — sol pleno, paleta saturada
  - `sky-footer.tsx` — footer compartido (Hoy + minutos + streak + copy)
  - `sky-today.tsx` — picker que decide qué fase mostrar
  - Todos aceptan `lowDetail` prop (esconde halos, nubes extra, estrellas extra) — gancho preparado para "low detail mode" futuro
- **Mockup `/sessions-mockup/sky-states`**: comparación lado a lado full vs lowDetail
- **Sidebar refactor importante**:
  - Header con marca: pill amarilla gradient con icono Sparkles + "Lumma" + subtítulo "Notas y estudio"
  - `SidebarGroupLabel` en lugar de `<span>` para "Herramientas"
  - Iconos uniformados a `size-4`
  - Grupo colapsable "Área de estudio" → "Solario" (`SidebarMenuSub`)
  - **User dropdown en footer** (`SidebarUserMenu` Client Component): avatar (imagen Google o iniciales fallback) + nombre + email + chevron, dropdown con Perfil + Cerrar sesión (variant destructive)
  - `SidebarMobileAutoClose` ya estaba presente (cierra drawer al navegar en mobile)
- **`signOutAction()` extraída** a `server/actions/auth-actions.ts` (Client Components no pueden importar `signOut` de NextAuth directamente)
- **Variant `sidebarMenuSubButtonVariants`** añadido a `components/ui/sidebar-variants.ts`
- **Componente `collapsible` instalado** vía `pnpm dlx shadcn@latest add collapsible`
- **Componente `dropdown-menu` instalado** (previamente)
- Bug recurrente del Slot + Link + asChild: ahora también aplica a `CollapsibleTrigger asChild + SidebarMenuButton`. Solución universal: usar la variante directa sobre `<button>` o `<Link>` plano, sin componentes intermedios que también usen Slot
- Bug Prisma cliente stale (column `Note.isQuickNote` does not exist) → `pnpm prisma generate` + restart dev. Habría que añadir `predev: prisma generate` al package.json

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
- CRUD completo de carpetas
- CRUD completo de notas (con BlockNote, Shiki, kebab menu para mover/eliminar)
- `/home` con FastNotes (autosave funcional), Inbox pill, folder pills, notas recientes
- `/inbox` lista notas sin carpeta
- `/folders` y `/folders/[folderId]` con breadcrumbs
- `/notes/[noteId]` editor BlockNote con code blocks claros (14 lenguajes via Shiki) y kebab menu
- `/feedback` foro completo con votos y estrellas
- `/profile` perfil completo (avatar, nombre editable, cambio de contraseña)
- `/solarium` hub estético (mock data, falta enchufar server actions)
- `/sessions-mockup/sky-states` mockup comparativo de fases del cielo + low detail
- Server actions de Solarium completas (no enchufadas a UI todavía)
- Sidebar pulido con header brand, grupo colapsable, user dropdown footer
- Despliegue Vercel + Neon

### ⏳ A medio terminar (Solarium)

- **Fase 3 (hub)**: estética hecha, falta enchufar `getActiveSession`, `getStreak`, `getRecentSessions` y crear `getTodayStudyMinutes`. La página tiene constantes mock con TODO marcado.
- **Fase 4**: `/solarium/new/page.tsx` vacío
- **Fase 5**: `(solariumspace)/layout.tsx` y `/active/page.tsx` vacíos (la más densa: timer, heartbeat, beforeunload)
- **Fase 6**: result interno (estado de /active con celebración)
- **Fase 7**: borrar `/sessions-mockup` entero + añadir item "Solario" definitivo al sidebar (ya existe en collapsible "Herramientas" → "Área de estudio")

### ❌ Sin empezar / pendiente

- Rate limiting en server actions (CRÍTICO si abres a usuarios reales)
- Verificación email con Mailtrap (plan en `auth-with-password.md`)
- Auto-delete de notas (campo eliminado del schema en cleanup)
- **Logo profesional** — actualmente placeholder `Sparkles` amarillo en pill gradient. Cuando se cierre Solarium MVP, contratar diseñador / generar con IA / iterar en Figma
- **Active route highlighting** en sidebar (requiere convertir parte a Client Component con `usePathname()`)
- Decisión sobre rebrand de Lumma vs LumaNote (lumanote.org)
- Estado activo de la ruta actual en sidebar (los nav items no destacan cuando estás en ellos)
- Spike `/lab/flashcards` para validar IA (paralelo, no bloquea Solarium MVP)
- Cleanup: borrar `home-client.tsx` huerfano si sigue ahí
- **Modales de confirmación para acciones destructivas** — actualmente las eliminaciones (nota, carpeta, post de feedback, futuras de sesión) usan `window.confirm()` nativo del navegador. Pendiente reemplazar por `AlertDialog` de shadcn (`pnpm dlx shadcn@latest add alert-dialog`). Sitios afectados: `components/notes/note-actions-menu.tsx`, eliminar carpeta en `folder-actions`, eliminar post de feedback. Mejora la UX y permite mostrar info contextual ("vas a eliminar 12 notas dentro de esta carpeta", etc.)

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

### 3. Sidebar items vacíos tras `revalidatePath` (RESUELTO 2026-05-06)

Causa: combinación Radix `Slot` + Next `<Link>` + `asChild` no era solo un warning de hydration silenciable — provocaba que los `<li>` del menú quedaran VACÍOS (sin children, `clientHeight: 0`) tras `revalidatePath` (al borrar carpetas, editar notas, redimensionar imágenes, etc.). El `suppressHydrationWarning` ocultaba el síntoma pero el bug afectaba producción.

**Fix aplicado**: refactorizar los menu items del sidebar para no usar `asChild` + Slot — el `<Link>` es ahora directamente el botón con sus clases inline (via `sidebarMenuButtonVariants()` y `sidebarMenuSubButtonVariants()`). Adiós Slot, adiós bug.

**Lección**: cuando `suppressHydrationWarning` se usa como band-aid, sigue investigando — puede estar ocultando algo serio. Y **NO es solo console noise**, también puede romper la UI en silencio.

### 4. Mismo bug del Slot pero con `CollapsibleTrigger asChild + SidebarMenuButton` (RESUELTO 2026-05-11)

Misma raíz que el bug 3. `CollapsibleTrigger asChild` (Slot) → `SidebarMenuButton` (que usa Slot internamente) → cadena `Primitive.button.Slot → Primitive.button.SlotClone` que React 19 + Turbopack no reconcilia bien.

**Fix**: cambiar `<SidebarMenuButton>` por `<button type="button" className={sidebarMenuButtonVariants()}>`. Regla universal: cuando tengas un componente Radix con `asChild`, mete dentro un elemento HTML plano (`<button>`, `<Link>`, `<a>`) con clases via variant, NUNCA otro componente que pueda usar Slot.

### 5. MutationObserver loop infinito en BlockNote spellcheck (REVERTIDO 2026-05-07)

Intentamos desactivar el spellcheck en code blocks con un `MutationObserver` que ponía `spellcheck="false"` en cada `<code>`. Cada `setAttribute` disparaba ProseMirror's reconciliador, que regeneraba nodos, lo que disparaba el observer otra vez. Loop hasta congelar la pestaña.

**Estado**: revertido. Aceptamos squigglies en code blocks como cosmético menor. Si se retoma: investigar BlockNote `editorProps` de ProseMirror o sobrescribir `createCodeBlockSpec` para añadir el atributo en su render inicial.

### 6. Prisma client stale tras cambio de rama (RECURRENTE)

Síntoma: `The column 'Note.isQuickNote' does not exist in the current database`. Causa: cambias de rama (p.ej. `dev → feature/solarium`), el schema cambia, pero `apps/web/generated/prisma/` sigue siendo el de la rama anterior.

**Fix**: `cd apps/web; pnpm prisma generate` y reiniciar dev server.

**Mejora futura**: añadir `"predev": "prisma generate"` al `package.json` de `apps/web` para automatizar.

### 7. Git mess Solarium revert + revert-of-revert (RESUELTO 2026-05-07/2026-05-11)

Solarium se pusheó a dev por error (commit `0344867`), rompía Vercel build. Hicimos:
1. `git checkout -b feature/solarium` para preservar el trabajo
2. `git revert 0344867` en dev → commit `59f0d8e`
3. Pero el revert acabó también en feature/solarium local
4. Push posterior pisó remoto con el revert
5. Recuperación con `git revert 59f0d8e` (revert-of-revert) → commit `c73c24f` re-aplica Solarium

Resultado final: `feature/solarium` tiene historia "fea pero honesta" (add → revert → reapply). Cuando se mergee a dev, hacer `git merge --squash` para limpiar.

**Lección**: antes de hacer `git push` confirma en qué rama estás (`git branch --show-current` o configurar prompt con git). El upstream de la rama local puede no coincidir con el nombre.

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

1. **Solarium Fase 3 — enchufar datos al hub**: la página `/solarium/page.tsx` tiene la estética terminada con mock data. Hay que reemplazar las 3 constantes (`TODAY_MINUTES`, `STREAK`, `recentSessions`) por llamadas a las server actions ya existentes (`getStreak()`, `getRecentSessions(10)`, etc). Convertir el componente en `async function` y hacer `Promise.all`. Además crear `getTodayStudyMinutes()` (no existe aún — patrón sugerido: `prisma.studySession.aggregate({ ..., _sum: { studyMinutes: true } })` filtrando por `startedAt >= startOfDay` y status no ACTIVE). Conectar el `SkyToday` picker para que use minutos reales.
2. **Solarium Fase 4 — `/solarium/new`**: archivo creado pero vacío. Necesita selector de carpeta + chips de duración (25/50/90) + botón "empezar" que llame `createSession` y redirija a `/active`.
3. **Solarium Fase 5 — sesión activa** (la más densa, ~2 sesiones de trabajo):
   - `(solariumspace)/layout.tsx` vacío — layout sin sidebar (distraction-free)
   - `(solariumspace)/active/page.tsx` vacío — timer grande, sub-sidebar de notas, botones abandon/complete
   - Necesario: heartbeat client cada 30s, `beforeunload + sendBeacon`, lazy cleanup ya implementado en `getActiveSession`
4. **Solarium Fase 6 — Result interno**: estado de celebración dentro de `/active` antes de redirigir
5. **Solarium Fase 7 — Cleanup**:
   - Borrar `app/(workspace)/sessions-mockup/` completo
   - El item "Solario" ya existe en el sidebar dentro del grupo "Herramientas" — comprobar si quieres dejarlo así o moverlo a un nivel superior
6. **Spike IA flashcards** (paralelo, no bloquea Solarium) — `/lab/flashcards` con Gemini Flash, validar calidad y latencia
7. **Logo profesional** — pendiente desde 2026-05-11. Cuando Solarium MVP esté cerrado: contratar diseñador / generar con IA / iterar en Figma. Placeholder actual: pill amarilla gradient con icono Sparkles en `(workspace)/layout.tsx`
8. **Verificar drift Neon** (sección "drift de schema en Neon"). Si la migración `add_study_sessions` se aplicó a Neon antes del revert, hay que decidir si rollback o `prisma migrate resolve --applied`
9. **Active route highlighting** en sidebar (requiere convertir parte del sidebar a Client Component con `usePathname()`)
10. **Cleanup código**: comprobar y borrar `home-client.tsx` huerfano si sigue ahí
11. **Rate limiting** en server actions (CRÍTICO antes de abrir a más usuarios)
12. **Decisión sobre rebrand**: cambiar de "Lumma" a otro nombre por el conflicto con Luma — sin urgencia, opción A (proyecto de aprendizaje) vigente
13. **Añadir `predev: prisma generate`** al `package.json` de `apps/web` para evitar bugs de cliente desactualizado al cambiar de rama
14. Verificación email con Mailtrap

### Hecho (no repetir)

- ~~Página de perfil~~ — ✅ hecha 2026-05-05
- ~~Validación con Zod en feedback-actions~~ — manual con `if`, decisión consciente low-risk
- ~~Bug del sidebar (empty `<li>` tras revalidatePath)~~ — ✅ arreglado 2026-05-06
- ~~Schema StudySession + migración~~ — ✅ aplicada en local
- ~~Server actions Solarium~~ — ✅ todas implementadas 2026-05-08
- ~~Sky components extraídos~~ — ✅ con lowDetail prop 2026-05-11
- ~~Sidebar refactor (header, collapsible, user dropdown)~~ — ✅ 2026-05-11
- ~~Cleanup schema (isQuickNote, autoDelete)~~ — ✅ ya no están en schema, BD local ya migrada
- ~~Spellcheck en code blocks~~ — descartado, aceptamos squigglies por bug con ProseMirror

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

---

## Solarium — diseño cerrado (2026-05-06)

### Identidad y naming

- **Solario / Solarium** = la sección donde se compone la sesión de estudio. Engloba TODAS las herramientas: Pomodoro hoy, flashcards/quiz/resumen IA en el futuro
- En código/URLs: `solarium` (inglés/latín, consistente con `home`, `inbox`, `folders`)
- En UI/branding/marketing: **"Solario"** (español)
- Patrón: code en inglés, labels en español. Igual que `home` → "Inicio"

### Decisiones del modelo (todas cerradas)

| Decisión | Valor |
|---|---|
| Definición "completed" | actualDuration >= targetDuration |
| Pomodoro | Visual solo, 1 sesión = 1 unidad continua |
| Ventana arrepentimiento | 30s antes de persistir, sin penalty |
| Política de salida | **Humana**: tab switch SIN penalty, solo cierre real / abandonar penaliza |
| Detección cierre | beforeunload + sendBeacon + heartbeat 30s + cleanup server side |
| Multi-dispositivo | Una sesión activa por usuario |
| Día del streak | Por `startedAt.toLocalDate()` del user (no UTC) |
| Stats en abandonadas | **Sí**, se guardan study/break minutes incluso en failed (no es total loss) |
| Sidebar durante sesión | Oculta vía route group `(solariumspace)` |
| Goal por defecto | 60 min/día |
| Mínimo registrable | 10 min de estudio real |
| Cielo en tiempo real durante sesión | NO en MVP, solo timer |

### Sistema de marca

- **Lumma** = luz (app)
- **Luminita** = pequeño sol personificado, voz de la IA (resumen, flashcards, quiz). Survives rebranding del nombre principal porque no depende de "Lumma"
- **Clima en calendario** según actividad: ☀️ sol pleno (90+min), 🌤️ sol entre nubes (50+), ⛅ sol tímido (1+), vacío (0)
- **Failed sessions NO aparecen como lluvia** — sin metáfora punitiva. El clima refleja lo que hiciste, no lo que abandonaste
- **Lenguaje del producto**: "tu cielo está despejado", "amanece", "sol pleno"

### Routing decidido

```
app/
├── (workspace)/
│   └── solarium/page.tsx       ← /solarium (hub, con sidebar)
└── (solariumspace)/
    ├── layout.tsx               ← sin sidebar (distraction-free)
    └── active/page.tsx         ← /active (singleton, una activa por user)
```

NO hay `/active/[id]` ni `/result/[id]`. Razón: una sesión completada **no es entidad linkeable**, es un evento del pasado que aparece como card en stats del hub. Completion se muestra como **estado interno** de `/active` (celebración + botón volver) antes de redirigir a `/solarium`.

Folder vacíos ya creados pero pendientes de rellenar:
- `apps/web/app/(workspace)/solarium/page.tsx` (vacío)
- `apps/web/app/(solariumspace)/layout.tsx` (vacío)
- `apps/web/app/(solariumspace)/active/page.tsx` (renombrar de `solariumActive` a `active`)

### Schema final (revisado y aplicado en `schema.prisma`)

```prisma
enum StudySessionStatus {
  ACTIVE
  COMPLETED
  ABANDONED
}

model StudySession {
  id       String  @id @default(uuid())
  userId   String
  user     User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  folderId String?
  folder   Folder? @relation(fields: [folderId], references: [id], onDelete: SetNull)

  startedAt  DateTime  @default(now())
  endedAt    DateTime?
  lastSeenAt DateTime  @default(now())   // heartbeat

  targetMinutes Int
  studyMinutes  Int @default(0)          // focus real
  breakMinutes  Int @default(0)          // descanso Pomodoro

  status StudySessionStatus @default(ACTIVE)

  notesTouched String[]                   // notas abiertas durante la sesión
  notesCreated String[]                   // notas creadas durante la sesión

  @@index([userId, startedAt])
  @@index([userId, status])               // para "tienes activa?"
}
```

Añadir en `User`: `studySessions StudySession[]`. Añadir en `Folder`: `studySessions StudySession[]`.

**Cambios respecto a versión anterior**:
- Replaced `completed` + `abandoned` booleans (estados inválidos posibles) con enum `StudySessionStatus`
- Eliminado `createdAt` redundante con `startedAt`
- Añadido `notesCreated` separado (mockup mostraba "3 revisadas · 1 nueva", son métricas distintas)
- Segundo índice por `[userId, status]` para query frecuente

### Plan de implementación (7 fases)

| Fase | Qué | Estado |
|---|---|---|
| 0 | Defaults rápidos (decisiones pendientes) | ✅ hecho 2026-05-06 |
| 1 | Schema StudySession + migración | ✅ aplicada en local 2026-05-06 (campo `title` añadido 2026-05-08) |
| 2 | Server actions (`createSession`, `heartbeat`, `abandonSession`, `completeSession`, `getActiveSession`, `getRecentSessions`, `getStreak`) | ✅ todas implementadas 2026-05-08 en `solarium-actions.ts` |
| 3 | Hub real `/solarium` con datos de DB | 🟡 estética hecha 2026-05-11, falta enchufar server actions (mock data en consts marcadas TODO) |
| 4 | Crear sesión real `/solarium/new` | ⏳ archivo creado vacío |
| 5 | Sesión activa `/active` con timer, heartbeat, beforeunload | ⏳ archivos creados vacíos. La fase más densa, ~2 sesiones |
| 6 | Result interno (estado de /active) con celebración | ⏳ |
| 7 | Borrar mockup `/sessions-mockup` + sidebar item definitivo (ya existe en collapsible "Herramientas" → "Área de estudio" → "Solario") | ⏳ |

**Total restante**: ~5 sesiones de trabajo. Lo siguiente es Fase 3 (enchufar datos al hub).

### Sky components extraídos (2026-05-11)

`components/solarium/sky/` con 4 componentes de estado del cielo + 1 picker + 1 footer compartido:

- **`sky-night.tsx`** — 0 min hoy. Cielo índigo, luna y estrellas. Copy: *"Tu cielo aún no ha amanecido"*
- **`sky-dawn.tsx`** — 1-30% del target. Cielo coral, sol naranja asomando. Copy: *"Tu sol está amaneciendo"*
- **`sky-morning.tsx`** — 30-75%. Paleta amber/azul, sol subiendo. Copy: *"Tu sol está al X%"*
- **`sky-midday.tsx`** — 75%+. Sol pleno, paleta saturada. Copy: *"Sol pleno"*
- **`sky-footer.tsx`** — footer reusable con `Hoy`, minutos, `streak` pill y children=copy
- **`sky-today.tsx`** — picker que decide qué fase mostrar según `(todayMinutes, target)`

Cada componente acepta prop `lowDetail`. Activar lowDetail oculta: halos `blur-3xl`, nubes extras, estrellas extras, sombras del sol. **Mantiene siempre**: gradient del cielo, sol/luna principal, 1 nube, footer con stats. Gancho preparado para conectar a `prefers-reduced-motion` o detección de mobile/batería baja en el futuro.

Mockup comparativo en `/sessions-mockup/sky-states` (full vs lowDetail side-by-side).

### Constantes en server actions

En `solarium-actions.ts`:
- **`STALE_HEARTBEAT_MS = 2 * 60 * 1000`** — si `lastSeenAt` lleva más de 2 min, `getActiveSession` marca ABANDONED y devuelve null. Es el lazy cleanup que sustituye a un cron job.

Decisiones clave:
- **`createSession` idempotente**: si ya hay ACTIVE, devuelve la existente (no error)
- **`completeSession` confía en el cliente**: no valida que `studyMinutes >= targetMinutes`. La UI no debería llamarla antes.
- **`getStreak` gracia de 1 día**: si hoy no completaste pero ayer sí, la racha sigue. Solo se rompe al pasar 2 días sin sesión.
- **Días en UTC**: trade-off MVP. Para usuarios en zonas horarias muy distintas del server puede haber 1 día de desfase.

### MVP scope (cortado agresivamente)

✅ Mantener:
- Selección de carpeta + duración (chips 25/50/90)
- Una sesión continua (Pomodoro = visual)
- Heartbeat + detección cierre
- Stats save siempre (completed o abandoned)
- Streak por día con sesiones completed
- Sub-sidebar de notas durante sesión activa
- Crear/editar notas durante sesión

❌ Fuera del MVP:
- Plantillas funcionales (mockeadas hardcoded)
- Sistema crear plantilla con builder
- IA / Luminita / Flashcards
- Cielo cambia en tiempo real durante sesión
- Compartir plantillas
- Sesiones grupales

### Reality check de la IA (siguen vigentes)

- **Gemini 2.0 Flash**: gratis con rate limits razonables
- **Groq + Llama 3**: gratis con rate limits
- **Claude Haiku**: barato y bueno
- Para proyecto personal con decenas de users → **céntimos al mes**

Blocker no es coste, es **prompt engineering, latencia y manejo de errores**. Spike pendiente en `/lab/flashcards` (paralelo, no bloquea Solarium MVP).

### Notas sobre streaks (cuando se llegue)

Streak es droga de engagement pero también ansiedad. Duolingo perdió usuarios al romper streak de 200 días. Considerar para v2:
- **Días de gracia** (1-2 al mes automáticos)
- **Pausa de viaje** (configurable manualmente)
- **Streak congelado** durante exámenes/vacaciones

Apuntar para v2 del feature, no para MVP.

### Mockup actual

Vive en `apps/web/app/(workspace)/sessions-mockup/`. Construido con `_components/` para los modales. **Borrar entera tras Fase 7**. Sirve como referencia visual durante implementación. URL: `/sessions-mockup`.

### Idea social diferida (no urgente)

Discutida 2026-05-06: Lumma podría tener visibilidad entre usuarios para "ver amigos estudiando", sesiones grupales, compartir notas read-only. **Decidido NO añadir al schema actual** — YAGNI. Cuando llegue el momento, refactor con modelos `Friendship/Follow` y permission system. Por ahora schema "personal", refactorizar después si la network effect aparece.

---

## Admin Dashboard — idea futura (post-Sessions, no urgente)

Idea propuesta por Javier 2026-05-05. **No urgente** — diferida hasta que Sessions MVP esté cerrado. Se documenta aquí solo para no perder el plan.

### Concepto

Un panel solo accesible para Javier (admin) que agrupa tres responsabilidades:

1. **Cola de moderación de feedback** — los posts del foro pasan primero por aquí. Javier aprueba/rechaza antes de que sean públicos.
2. **Anuncios broadcast** — desde aquí Javier publica novedades, cambios, mantenimientos. Los usuarios los ven en algún sitio (campana, banner, sección dedicada).
3. **Reconocimiento individual** — agradecer a usuarios concretos por aportaciones específicas (cuando se implementa algo que pidieron).

### Cambios arquitectónicos que requiere

**User**:
- Añadir `isAdmin Boolean @default(false)` (suficiente para empezar; no hacer falta sistema de roles complejo)

**FeedbackPost**:
- Añadir `status: pending | published | rejected` (enum)
- `getFeedbackPosts` filtra por `status: published`
- Nuevo `getPendingFeedback` para admin

**Modelo nuevo `Announcement`**:
- `id, title, body, createdAt, authorId (admin), publishedAt`
- Considerar `AnnouncementRead { userId, announcementId, readAt }` si se quiere tracking de leídos
- O simplemente: timestamp de "última visita a anuncios" en el User

**Rutas**:
- `/admin` con guard de `isAdmin`
- Middleware rechaza no-admins
- Todas las server actions del admin verifican `session?.user?.isAdmin`

**UI usuario**:
- Indicador visible de anuncios sin leer (campana, badge, banner)
- Mensaje "post pendiente de revisión" cuando manda feedback

### Decisiones UX pendientes (cuando se llegue)

- **¿Qué ve el usuario al mandar feedback?**
  - "Pendiente de revisión" (honesto, menos satisfactorio)
  - Post aparece como suyo solo (otros no lo ven hasta aprobar)
  - Post-moderation: aparece publicado, admin puede despublicar después

- **Agradecimientos públicos**: ¿posts especiales en foro? ¿anuncios atribuidos? ¿sección "shoutouts" propia?

### Solución intermedia hasta entonces

Mientras este dashboard no exista, si llega basura al foro de feedback: **borrado manual** desde la BD o desde la UI con permisos hardcoded (`if email === "javier.alcate@kuik.tech"`). Pragmático para el volumen actual de feedback (cero tráfico).

---

## ⚠️ Pendiente: drift de schema en Neon tras revert de Solarium (2026-05-07)

### Contexto

El 2026-05-07 por la mañana, Javier había pusheado a `dev` el commit `0344867` con toda la feature Solarium (incluyendo migración `20260506135432_add_study_sessions`). Ese commit rompía el deploy de Vercel y bloqueaba poder hacer fixes rápidos.

**Resolución aplicada**:
1. Trabajo Solarium preservado en rama nueva `feature/solarium` (pusheada a remoto)
2. En `dev`: `git revert 0344867` → commit `59f0d8e` que deshace los 21 archivos del Solarium, incluido el archivo de migración SQL
3. Push a `dev` → Vercel re-deploya limpio

### El problema latente

El `revert` borró el archivo `apps/web/prisma/migrations/20260506135432_add_study_sessions/migration.sql` de la rama `dev`. **Si esa migración ya se había aplicado a Neon (producción)**, ahora hay desajuste:

- Neon tiene la tabla `StudySession` creada (con su enum, índices, etc.)
- `dev` ya no tiene la migración que la creó
- Prisma no sabe que esa tabla "ya existe" porque no hay rastro en `_prisma_migrations`... bueno, depende: si la migración fue marcada como aplicada, Neon recordará que se aplicó la `20260506135432_add_study_sessions` aunque ya no exista el archivo

### No bloquea nada hoy

El código revertido **NO referencia `StudySession`**. Vercel deploya, la app funciona, los usuarios no notan nada. La tabla huérfana en Neon no rompe nada por sí misma.

### Cómo comprobar si se aplicó a Neon

Desde `apps/web/`:

```bash
# Editar .env temporalmente para apuntar a DATABASE_URL de Neon
# Luego:
pnpm prisma migrate status
```

Si el output incluye `20260506135432_add_study_sessions` como aplicada → **sí se aplicó**, drift confirmado.
Si dice "no migrations found" o lista solo las anteriores → no se aplicó, todo limpio.

### Opciones cuando se ataque (no urgente)

**Caso A: NO se aplicó a Neon** → cero problema. La migración existe solo en `feature/solarium`. Cuando se mergee, se aplica normal.

**Caso B: SÍ se aplicó a Neon** → opciones:
1. **Rollback en Neon**: `DROP TABLE "StudySession"; DROP TYPE "StudySessionStatus"; DELETE FROM "_prisma_migrations" WHERE migration_name = '20260506135432_add_study_sessions';` — vuelves al estado pre-Solarium en BD.
2. **Marcar como ya-aplicada al volver**: cuando mergees `feature/solarium` a dev, ejecutar `pnpm prisma migrate resolve --applied 20260506135432_add_study_sessions` apuntando a Neon. Le dice a Prisma "esto ya está hecho, no lo intentes aplicar".

### Recomendación

Antes de retomar `feature/solarium`, comprobar el estado de Neon (1 minuto). Decidir Caso A o B. Resolver. Continuar.

---

## Inventario de archivos clave (rama `feature/solarium`, estado 2026-05-11)

Para que un agente que entra en frío sepa qué tocar antes de releer todo:

### Solarium
- `apps/web/prisma/schema.prisma` — modelo `StudySession`, enum `StudySessionStatus`
- `apps/web/prisma/migrations/20260506135432_add_study_sessions/` — migración aplicada en local
- `apps/web/server/actions/solarium-actions.ts` — 7 server actions completas
- `apps/web/app/(workspace)/solarium/page.tsx` — hub estético con mock data
- `apps/web/app/(workspace)/sessions-mockup/` — mockup completo, BORRAR en Fase 7
- `apps/web/app/(workspace)/sessions-mockup/sky-states/page.tsx` — referencia visual de las 4 fases del cielo
- `apps/web/app/(solariumspace)/layout.tsx` — VACÍO, Fase 5
- `apps/web/app/(solariumspace)/active/page.tsx` — VACÍO, Fase 5
- `apps/web/components/solarium/sky/*.tsx` — 6 componentes Sky con lowDetail prop
- `apps/web/components/solarium/{abandon-button,folder-picker-button,save-as-template-button,templates-section}.tsx` — restos del mockup, reciclar o borrar según hagan falta

### Layout y sidebar (refactor 2026-05-11)
- `apps/web/app/(workspace)/layout.tsx` — sidebar pulido, user dropdown footer
- `apps/web/components/sidebar-user-menu.tsx` — Client Component del dropdown del usuario
- `apps/web/components/sidebar-mobile-auto-close.tsx` — cierra drawer en mobile al navegar
- `apps/web/components/ui/sidebar-variants.ts` — `sidebarMenuButtonVariants` + `sidebarMenuSubButtonVariants` (cva)
- `apps/web/server/actions/auth-actions.ts` — `signOutAction()` exportada para usar desde Client Components

### Editor
- `apps/web/components/notes/blocknote.tsx` — BlockNote con schema custom + Shiki + 14 lenguajes
- `apps/web/app/globals.css` — estilos del code block (claros) + selector pill estilizado

### Notas y carpetas
- `apps/web/components/notes/note-actions-menu.tsx` — kebab dropdown reusable (Mover + Eliminar)
- `apps/web/components/notes/move-to-folder-dialog.tsx` — selector de carpeta destino con animaciones motion
- `apps/web/components/notes/notes-search.tsx` — buscador en header con dropdown de resultados
- `apps/web/server/actions/notes-actions.ts` — incluye `moveNoteToFolder`, `searchNotes`

### Auth y middleware
- `apps/web/auth.ts` — config NextAuth v5 (Google + Credentials + Prisma adapter + JWT)
- `apps/web/proxy.ts` — middleware con cookie cleanup para JWTs inválidos

### Estado de la rama
- **Rama actual**: `feature/solarium`
- **Upstream**: `origin/feature/solarium`
- **Vercel deploya**: rama `dev` (no `feature/solarium`)
- **Historia "fea"**: tras el lío del 2026-05-07, hay `add Solarium → revert → reapply` en la historia. Cuando se mergee a dev, considerar `git merge --squash` para aplanar.
