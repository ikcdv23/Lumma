# Handoff — actualizado 2026-05-06 (final del dia)

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
- **Feature de feedback completa** (foro de comunidad con votos y estrellas)
- Sidebar reorganizado (Feedback movido al footer)
- Widths estandarizados a `max-w-5xl` en todas las paginas
- Lección aprendida sobre `useFormStatus` (debe estar DENTRO del form)
- **Reflexión estratégica**: descubierto competidor casi idéntico (lumanote.org)
- **Decisión pendiente**: rebrand de Lumma o seguir como proyecto de aprendizaje

Sesion 2026-05-06 (HOY):
- **Solarium completamente diseñado** — la sección de herramientas de estudio. Mockup construido en `/sessions-mockup` con 5 pantallas (hub, new, regret, active, result) y 5 modales conectados (preview plantilla, crear plantilla, folder picker, abandon, save as template)
- **Sistema de marca anclado**: Lumma (luz) + Luminita (IA = pequeño sol con personalidad) + clima en calendario (sol/nubes según actividad de estudio). Nuevo lenguaje: "tu cielo está despejado", "amanece", "sol pleno"
- **3 variantes visuales** comparadas para el módulo de actividad: Cielo del día / Horizonte mensual / Constelación semanal. Decidido: A como hero + C reciclado en cards de Recientes
- **Decisiones del modelo cerradas** (ver sección Solarium)
- **Schema StudySession** diseñado y revisado (enum `StudySessionStatus`, `lastSeenAt` para heartbeat, `notesTouched`/`notesCreated`)
- **Routing** decidido: `/solarium` en (workspace), `/active` (singleton, no [id]) en route group `(solariumspace)` para distraction-free
- **Plan de implementación** en 7 fases
- **Post de LinkedIn** redactado y publicado anunciando progreso
- Bug del sidebar (empty `<li>` tras revalidatePath, NO era solo warning de dev) → arreglado y commiteado
- Lección: añadir `predev: prisma generate` al package.json para evitar el bug "Prisma client desactualizado al cambiar de PC"

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

### 3. Sidebar items vacíos tras `revalidatePath` (RESUELTO 2026-05-06)

Causa: combinación Radix `Slot` + Next `<Link>` + `asChild` no era solo un warning de hydration silenciable — provocaba que los `<li>` del menú quedaran VACÍOS (sin children, `clientHeight: 0`) tras `revalidatePath` (al borrar carpetas, editar notas, redimensionar imágenes, etc.). El `suppressHydrationWarning` ocultaba el síntoma pero el bug afectaba producción.

**Fix aplicado**: refactorizar los menu items del sidebar para no usar `asChild` + Slot — el `<Link>` es ahora directamente el botón con sus clases inline. Adiós Slot, adiós bug.

**Lección**: cuando `suppressHydrationWarning` se usa como band-aid, sigue investigando — puede estar ocultando algo serio. Y **NO es solo console noise**, también puede romper la UI en silencio.

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

1. **Solarium Fase 1: Schema** — diseño cerrado, schema revisado y listo para migración.
   - Schema StudySession ya está aplicado en `apps/web/prisma/schema.prisma` (con enum status, notesTouched/Created, lastSeenAt)
   - Pendiente: `cd apps/web; npx prisma migrate dev --name add_study_sessions`
   - Verificar: `npx prisma generate` actualiza el client
2. **Solarium Fase 2: Server actions** — crear `apps/web/server/actions/solarium-actions.ts` con createSession, heartbeat, abandon, complete, getActive, getRecent, getStreak. Detalles en sección Solarium.
3. **Solarium Fase 3-7**: ver tabla en sección Solarium. Total ~7 sesiones para MVP.
4. **Spike IA flashcards** (paralelo, no bloquea Solarium) — `/lab/flashcards` con Gemini Flash, validar calidad y latencia
5. **Cleanup schema**: eliminar `isQuickNote`, `autoDeleteAfterDays`, `edited`, `updatedAt` de FeedbackPost. Migración local + Neon.
6. **Cleanup código**: borrar `home-client.tsx` huerfano, mockup `/sessions-mockup` (tras Fase 7 de Solarium)
7. **Rate limiting** en server actions (CRÍTICO antes de abrir a más usuarios)
8. **Decisión sobre rebrand**: cambiar de "Lumma" a otro nombre por el conflicto con Luma — sin urgencia, opción A (proyecto de aprendizaje) vigente
9. Verificación email con Mailtrap
10. ~~Página de perfil~~ — ✅ hecha 2026-05-05
11. ~~Validación con Zod en feedback-actions~~ — Javier optó por validación manual con `if`, decisión consciente para low-risk feature
12. ~~Bug del sidebar (empty `<li>` tras revalidatePath)~~ — ✅ arreglado y commiteado 2026-05-06

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

| Fase | Qué | Estimado | Estado |
|---|---|---|---|
| 0 | Defaults rápidos (decisiones pendientes) | 5 min | ✅ hecho |
| 1 | Schema StudySession + migración | 1 sesión | ⏳ pendiente |
| 2 | Server actions (createSession, heartbeat, abandon, complete, getActive, getRecent, getStreak) | 1 sesión | ⏳ |
| 3 | Hub real `/solarium` con datos de DB | 1 sesión | ⏳ |
| 4 | Crear sesión real `/solarium/new` | 1 sesión | ⏳ |
| 5 | Sesión activa `/active` con timer, heartbeat, beforeunload | 2 sesiones (la más densa) | ⏳ |
| 6 | Result interno (estado de /active) con celebración | media sesión | ⏳ |
| 7 | Borrar mockup `/sessions-mockup` + sidebar item nuevo "Solario" entre Inicio e Inbox | media sesión | ⏳ |

**Total**: ~7 sesiones reales hasta MVP cerrado.

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
