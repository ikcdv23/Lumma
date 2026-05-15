# Handoff — actualizado 2026-05-15

> Documento para retomar el trabajo en otra máquina o tras un break.
> Léelo **primero**. Para arquitectura detallada: [docs/concepts/arquitectura.md](concepts/arquitectura.md).

---

## Estado actual (TL;DR)

**Lumma es una app de notas con sesiones de estudio enfocadas (Solarium)**. MVP en producción.

| Aspecto | Estado |
|---------|--------|
| Producto en prod | ✅ Solarium MVP shipped (2026-05-14) |
| Arquitectura server | ✅ 3 capas universales en todo el código (refactor cerrado 2026-05-15) |
| Animaciones / loaders | ✅ Infraestructura completa (PR #4) |
| Branching | `dev` actúa como prod (no hay `main`). **Pendiente** crear separación staging/prod |
| Usuarios reales | Recién abierto. Métricas, rate limiting, error monitoring → todavía no |

### Lo que funciona end-to-end

- Auth (Google OAuth + Credentials con bcrypt)
- `/home` — FastNotes (autosave), pills de carpetas + Inbox, notas recientes
- `/inbox`, `/folders`, `/folders/[id]`, `/notes/[noteId]` — CRUD completo, editor BlockNote con autosave
- `/profile` — avatar, nombre, contraseña, eliminar cuenta
- `/feedback` — foro de comunidad (posts, votos, estrellas)
- `/solarium` — hub (recent + streak + TODAY_MINUTES reales)
- `/solarium/new` — configurador multi-material (carpetas + notas + duración)
- `/active` — workspace de sesión: tabs (Notas / Tareas placeholder / Tablero placeholder), sub-sidebar de material, BlockNote inline, timer flotante con expansión fluida, AlertDialog de abandono, botón "Nueva nota en sesión", auto-complete cuando timer = 0
- Sidebar pulido con user dropdown en footer
- Aviso "beta" visible en hub de Solarium

---

## Arquitectura canónica (mayo 2026)

### Estructura server (3 capas por feature)

```
apps/web/server/
├── auth/auth.actions.ts            (NextAuth wrappers, sin BD)
├── feedback/{repository,service,actions}.ts
├── folder/{repository,service,actions}.ts
├── note/{repository,service,actions}.ts
├── solarium/{repository,service,actions}.ts
└── user/{repository,service,actions}.ts
```

`server/actions/` ya **NO existe** — toda la deuda single-layer está cerrada.

### Reglas de oro

1. **Una carpeta por feature**, singular: `note/`, no `notes/`
2. **Naming con punto**: `note.repository.ts`, `note.service.ts`, `note.actions.ts` (no `note-repository.ts`)
3. **Reads desde Server Components → service directo**. No envolver en action.
4. **Mutations desde clientes → action thin** (auth + service + revalidate).
5. **Cross-feature reads** se permiten desde cualquier service contra cualquier repo
6. **Cross-feature mutations** se orquestan en la action, no en services (regla: "services no llaman a otros services")
7. **`requireAuthedUserId`** en pages (retorna `Promise<string>`, redirige si no auth)
8. **`getAuthedUserId`** en actions (retorna `Promise<string | null>`, decisión manual)
9. **Sufijo `Action`** en todas las server actions exportadas: `createNoteAction`, no `createNote`
10. **Sin Prisma fuera de repositories**. Si una capa superior necesita Prisma, falta un método en el repo.

### Decisiones arquitectónicas vigentes

- **Inbox como vista virtual**, no entidad. Es `WHERE folderId IS NULL`. No hay tabla.
- **Notes M:N con StudySession** vía Prisma implicit relation. Idem Folders ↔ StudySession.
- **Lazy cleanup de sesiones**: `getActiveSession` marca como ABANDONED si `lastSeenAt > 2 min`. No hay cron jobs.
- **`dev` actúa como prod hoy** (Vercel deploya `dev`). Pendiente crear `main` real.

---

## Donde retomar (siguiente sesión)

### 🛡 Bloque 0 — Polish infra (priorizar tras validación con users)

Antes de seguir con features nuevas. Estás abriendo a users reales y faltan defensas:

1. **Crear rama `main`** para separar staging/producción
   - Hoy `dev` deploya directo a prod. Un bug local → bug público inmediato.
   - Plan: crear `main` desde `dev`, Vercel deploya `main` como production y `dev` como preview. Workflow: `feature/* → dev → main`.
2. **Rate limiting** en server actions (`@upstash/ratelimit` o equivalente). Crítico — un user malicioso vacía el free tier de Neon en una tarde.
3. **Sentry free tier** — error monitoring. Hoy si algo se rompe en prod, el user lo sufre y nadie lo sabe.
4. **Analytics ligero** (PostHog free / Plausible). Métricas mínimas:
   - % users que entran al hub
   - % que crean sesión
   - % que completan vs abandonan
   - Frecuencia de retorno (D1, D7)

### 📦 Bloque 1 — Features pedidas explícitamente

1. **Tiempo extra estilo Forest**: cuando el timer llega a 0 y se auto-completa, ofrecer "+10 min" / "+25 min" / "Salir ya". Mantiene flow mental. Sin schema nuevo (reusar `targetMinutes` como "lo prometido" y `studyMinutes` como "lo real" — el segundo puede superar al primero). Opcionalmente `extensions: Int @default(0)` para estadística.
2. **Crear carpetas en sesión activa**: desde sub-sidebar, botón "Nueva carpeta" análogo al "Nueva nota". Action `createFolderInActiveSessionAction()` siguiendo el patrón de `createNoteInActiveSessionAction` (que ya está hecho y limpio tras el refactor — usar como referencia).
3. **Drag & drop notas → carpetas**: dentro de `/active`. Librería sugerida: `@dnd-kit/core`. `useDraggable` en notas, `useDroppable` en carpetas. Reutilizar `moveNoteToFolderAction` que ya existe en `note.actions.ts`.

### 🌒 Bloque 2 — Cerrar Fase 5 de Solarium

1. **Heartbeat real**: `useEffect` en `ActiveSession` con setInterval cada 45s → `heartbeatAction(sessionId)`. Sin esto, lazy cleanup marca abandoned a los 2 min sin actividad.
2. **`beforeunload` + `sendBeacon`** para cerrar pestaña/refresh → dispara abandono con minutos transcurridos.
3. **Navigation guard global**: el AlertDialog del botón "Abandonar" ya funciona. Falta interceptar clicks en `<Link>` externos a `/active` para mostrarlo también.
4. **Botón Completar manual**: para el caso "ya está, completo antes de tiempo".
5. **Persistir tab activa**: con `searchParams` (`?tab=notas`) o localStorage. Decisión pendiente.
6. **Borrar `/mockup`** cuando todo lo anterior cierre.

### 🤖 Bloque 3 — AI agent (futuro)

Decisión arquitectónica: **transversal a la app, no exclusivo de Solarium**. Etapas:

| Etapa | Qué | Prerequisito |
|-------|-----|--------------|
| 0. Spike | `/lab/flashcards` aislado con Gemini Flash | Nada |
| 1. Infra | `server/ai/` con rate limiting, quotas, logging | Etapa 0 validada |
| 2. Flashcards | Generar desde una nota | Etapa 1 |
| 3. Asistente en sesión | 4ª tab "Asistente" en `/active` | Etapa 2 |
| 4. Power features | Auto-clasificación inbox, resumen de carpeta, etc. | Etapa 3 |

Casos de uso transversales:
- `/notes/[id]` → reescribir, expandir, traducir, resumir
- `/inbox` → auto-clasificar notas sueltas a carpetas existentes
- `/folders/[id]` → generar índice / mapa conceptual

### 📋 Backlog secundario

- **Ficha técnica de sesión** — `/solarium/sessions/[id]` con detalle (cuándo empezó/terminó, qué notas tocó, duración real vs target). `RecentSessionCard` ya tiene `cursor-pointer` preparado.
- **Rebranding pass** post-MVP — coherencia visual cross-feature (tipografía, spacing, radios, idioma UI).
- **Logo profesional** — actualmente Sparkles placeholder. Cuando se cierre fase de polish.
- **Active route highlighting** en sidebar (necesita Client Component con `usePathname()`).
- **Modales AlertDialog** para acciones destructivas (hoy se usa `window.confirm()` en algunos sitios: `note-actions-menu.tsx`, eliminar carpeta, eliminar post feedback).
- **Email reset password** — Resend free tier 3.000/mes. Necesita dominio propio.
- **Verificación email** con Mailtrap.
- **Decisión rebrand Lumma vs LumaNote** (lumanote.org descubierto como competidor).
- **Streak=0 UX** — decidir entre ocultar pill o copy motivadora.
- **`predev: prisma generate`** en `package.json` para evitar Prisma client stale al cambiar de rama.

---

## Convenciones / lecciones consolidadas

### React / Next.js 16

- Server Components por defecto, `"use client"` solo cuando hay hooks/eventos
- Patrón Server + Client: page como Server Component, partes interactivas en Client Components
- `useActionState` para errores en forms (firma `(prevState, formData)`)
- `useFormStatus` SOLO dentro de un `<form>` — extrae el botón a componente propio si lo necesitas
- `redirect()` tiene return type `never` — TS sabe que el código después no se ejecuta (habilita `requireAuthedUserId`)
- **Regla de Hooks**: `useState`/`useEffect` se identifican por **posición**, nunca llamarlos condicionalmente
- **`key` para forzar remount** cuando un componente tiene state ligado a la identidad de una entidad (ej. `EditableNote` cambia de nota → key={note.id} → state limpio)
- **Route groups y CSS scope**: cada layout en App Router es un árbol CSS aparte. Si una librería carga CSS lateral, importarlo en cada layout que la consume.
- `asChild` en shadcn cuando quieres que el hijo (Link, button) sea el elemento real
- Debounce con `useEffect` + `setTimeout` + cleanup `clearTimeout`

### Prisma

- **Filtrar por `userId`** en TODAS las queries (seguridad)
- Tras `prisma migrate` o `prisma generate`: **reiniciar `pnpm dev`** (cliente cacheado en `globalThis`)
- Antes de mergear a `dev` con migración nueva: aplicar a Neon (`pnpm prisma migrate deploy` con DATABASE_URL apuntando a Neon)
- Generated client en `apps/web/generated/prisma` — importar tipos desde `@/generated/prisma/client`

### Animaciones (motion library)

- `components/motion/primitives/` — wrappers (`<FadeIn>`, `<SlideUp>`, `<ScaleIn>`, `<Stagger>`). Pages no importan `motion/react` directamente (DIP).
- `components/loaders/` — `Spinner`, `PulseDot`, `ProgressBar`, `SkeletonCard`, `FullPageLoader`.
- `loading.tsx` en route folders → Next monta Suspense boundary automático.
- Layout animations con `<motion.div layout>` + `layoutId` para transiciones fluidas entre estados (ej. FloatingTimer pill ↔ panel).

### YAGNI

- Si añades campos al schema "por si acaso" pero nunca los usas, **bórralos**. Migrar es trivial.
- Si propones una prop "podría hacer falta" pero no la usas, **NO la añadas**.

### Deuda técnica con disciplina

- Identificar el smell, **anotarlo como ticket de deuda**, aplazar refactor con plan claro. No parchear.
- Ejemplo histórico cerrado: la `createNoteInActiveSessionAction` tocaba Prisma directo durante semanas (registrado en deuda) hasta que el refactor a 3 capas lo cerró limpiamente.

---

## Reglas UX cerradas para Solarium

### Filosofía

**Zen Mode estricto**. Una vez entras a una sesión, te quedas hasta el final o te vas. No hay "pausar y reanudar entre tabs". El tiempo estudiado **siempre cuenta** — sin penalty por abandonar.

### Estados del hub (`/solarium`)

| Situación | Comportamiento |
|---|---|
| Sin sesión activa | CTA "Empezar a estudiar" → `/solarium/new` |
| Con sesión ACTIVE | Auto-redirect a `/active`. NUNCA mostrar "Reanudar" |
| Sesiones recientes | Solo COMPLETED y ABANDONED |
| Streak = 0 | Decidir (ocultar pill vs copy motivadora) |

### Página activa (`/active`)

| Aspecto | Decisión |
|---|---|
| Layout | Sin sidebar (route group `(solariumspace)`) |
| Cierre / refresh | `beforeunload` + `sendBeacon` a `/api/solarium/abandon` |
| Navegación interna | AlertDialog custom con 3 botones (Quedarme / Abandonar / Completar) |
| Display del timer | "MM:SS" grande + "{target} min · {elapsed} transcurridos" — patrón Apple Activity Rings |
| Timer = 0 | **Auto-complete**: marca COMPLETED, celebración visual, botón "Salir" |

### Naming consistente

- En código y URLs: `solarium` (inglés)
- En UI: **"Solarium"**
- Deuda asumida: el resto de la app mezcla idiomas (Home/Inicio, Folder/Carpetas). Se resolverá en el Rebranding pass.

### Lo que NO está en MVP

- ❌ Botón "Reanudar"
- ❌ Pausa explícita (Pomodoro visual solamente, sin pausas — tiempo extra estilo Forest sí planeado)
- ❌ Multi-tab con misma sesión
- ❌ Edición de duración a mitad
- ❌ Modo móvil optimizado (desktop-first)

---

## Workflow del user

Javier prefiere:

- **Aprender, no que el AI escriba código por él** — explicar antes de tocar archivos
- **Para UI/diseño OK que el AI escriba**, para lógica él lo implementa
- **Ir paso a paso** — un cambio a la vez
- **Verificar antes de feedback** — leer el archivo real, no asumir
- **No añadir features extra que no se piden**
- **Respuestas directas, sin trailing summaries, sin emojis innecesarios**
- **Idioma**: español
- **Prefiere preguntar el "por qué"** y entender principios subyacentes
- **GitHub auth**: si push falla con 403 a `ikcdv23/Lumma`, ejecutar `gh auth switch` autónomamente y reintentar

---

## Comandos útiles

```bash
# Levantar todo (desde raíz)
pnpm dev

# Migración tras cambiar schema (desde apps/web/)
pnpm prisma migrate dev --name nombre-descriptivo

# Regenerar cliente Prisma manualmente
pnpm prisma generate

# Aplicar migraciones a Neon (con .env apuntando a Neon)
pnpm prisma migrate deploy

# Ver/editar BD visualmente
pnpm prisma studio

# Verificar tipos
pnpm --filter web check-types

# Levantar BD (Docker)
docker compose up -d

# Estado Vercel del último commit en dev
gh api repos/ikcdv23/Lumma/commits/dev/status

# Comprobar PR
gh pr view <number>
```

---

## Admin Dashboard — idea futura (post-MVP, no urgente)

Idea propuesta 2026-05-05. Panel solo para Javier (`isAdmin Boolean`) con:

1. **Cola de moderación de feedback** — posts pasan por aquí antes de publicarse
2. **Anuncios broadcast** — modelo nuevo `Announcement`
3. **Reconocimiento individual** — agradecer aportaciones específicas

Cambios necesarios:
- `User.isAdmin Boolean @default(false)`
- `FeedbackPost.status: pending|published|rejected` (enum)
- `getFeedbackPosts` filtra por `status: published`
- Modelo nuevo `Announcement` (id, title, body, createdAt, authorId, publishedAt)
- `/admin` ruta con guard de `isAdmin`
- Indicador en UI de anuncios sin leer

Solución intermedia hasta entonces: borrado manual desde BD o UI con permisos hardcoded por email.

---

## Estado de las ramas

- **`dev`** — rama de producción (Vercel deploya aquí)
- **`main`** — no existe todavía (ver Bloque 0 de "Donde retomar")
- **Feature branches**: convención `feature/<short-slug>`. Ya hay varias mergeadas y limpiables:
  - `feature/solarium` (mergeada PR #3)
  - `feature/animations-and-loaders` (mergeada PR #4)
  - `feature/notes-three-layer` (mergeada PR #5)
  - `feature/LUMMA-02-Change-password` (PR #1, ya cerrada en `dev`)

---

## Solarium — schema y conceptos clave

### Schema (`StudySession`)

```prisma
model StudySession {
  id            String              @id @default(uuid())
  title         String
  targetMinutes Int                                          // duración prometida
  studyMinutes  Int       @default(0)                        // tiempo real estudiado
  breakMinutes  Int       @default(0)                        // tiempo real de pausa (pomodoro futuro)
  startedAt     DateTime  @default(now())
  endedAt       DateTime?
  lastSeenAt    DateTime  @default(now()) @updatedAt         // heartbeat
  status        StudySessionStatus  @default(ACTIVE)         // ACTIVE | COMPLETED | ABANDONED
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String
  folder        Folder[]                                     // M:N implícita
  notes         Note[]                                       // M:N implícita
}
```

### Conceptos

- **Una sesión activa por user a la vez** — enforced en `createSession` (devuelve la existente si ya hay ACTIVE)
- **Lazy cleanup**: `getActiveSession` marca ABANDONED si `lastSeenAt > 2 min`. No requiere cron
- **Streak**: solo COMPLETED cuenta. Tolerancia: empezó hoy o ayer. Mira `solariumService.getStreak`
- **TODAY_MINUTES**: suma de `studyMinutes` de hoy con `status != ACTIVE`. Cuenta abandonadas también — el tiempo es tiempo

### Componentes clave de `/active`

```
components/solarium/active/
├── active-session.tsx       (coordinador: state + layout)
├── active-topbar.tsx        (topbar + tabs + AlertDialog de abandono)
├── material-sidebar.tsx     (carpetas + notas sueltas + botón Nueva nota)
├── active-note-editor.tsx   (wrapper que usa <EditableNote>)
├── floating-timer.tsx       (pill ↔ panel con motion layoutId)
└── coming-soon.tsx          (placeholder Tareas/Tablero)
```

Y `components/notes/editable-note.tsx` — editor reusable extraído, con autosave (debounce 500ms) y `onSaveStatusChange` callback. Usado por `/notes/[id]` y `/active`.

### Feature feedback (community board)

Sistema tipo foro/Canny:
- Posts con texto + rating (1-5 estrellas)
- Votos toggle (1 por user por post)
- Borrar propios posts
- **No editables**, **sin comentarios anidados** (decisión de simplicidad)
- Hoy todos los posts son públicos. Cuando exista admin dashboard, pasarán por moderación.
