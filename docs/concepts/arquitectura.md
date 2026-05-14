# Arquitectura — Guía de consulta

Referencia rápida sobre la arquitectura de capas en Lumma. Pensada para consultar cuando dudes "¿dónde va esto?".

## Las 3 capas

```
   Cliente (navegador)
        ↓
   ┌─────────────────────────┐
   │  Action ("use server")  │  ← auth, validación, revalidate
   └─────────────────────────┘
        ↓
   ┌─────────────────────────┐
   │  Service                │  ← reglas de negocio, orquestación
   └─────────────────────────┘
        ↓
   ┌─────────────────────────┐
   │  Repository             │  ← queries Prisma
   └─────────────────────────┘
        ↓
   PostgreSQL
```

Los **Server Components** (pages async) llaman al **service directamente** para leer, saltándose la capa de actions.

---

## Quién hace qué

| Capa | Hace | NUNCA hace |
|---|---|---|
| **Repository** | `prisma.*`, recibe `userId` y filtra | `auth()`, lógica de negocio, llamar a otros repos |
| **Service** | Reglas, validaciones de negocio, cálculos, orquestación entre repo y otros servicios cruzados (solo lecturas) | `prisma.*` directo, `auth()`, `revalidatePath` |
| **Action** | `auth()`, validación Zod, llamar a service, `revalidatePath`, `redirect` | `prisma.*` directo, lógica de negocio compleja |

---

## El test del cron

Cuando dudes dónde va una función:

> **¿Esto puede correr sin request HTTP, sin sesión activa, sin navegador?**

- **Sí** → service (o repo si solo es query)
- **No** → action

---

## Indicadores visuales rápidos

Si ves esto en el código:

| Token | Es casi seguro... |
|---|---|
| `auth()` | Action |
| `revalidatePath` / `revalidateTag` | Action |
| `redirect()` | Action |
| `cookies()` / `headers()` | Action |
| Recibe `FormData` | Action |
| `prisma.*` | Repository |
| Recibe `userId` como parámetro y nada de lo anterior | Service |

---

## Regla de comunicación entre capas

```
Action      → Service de su feature + services de otras features (con moderación)
Service     → Su repo + repos de otras features (solo lectura)
Repository  → Solo Prisma
```

**Regla de oro**: los services **no se llaman entre sí**. Si necesitas combinar lógica de varios services, la orquestación vive en la **action** (o en una capa de use case si crece).

**Por qué**: service-to-service crea una telaraña de dependencias (dependency web). Cambiar algo pequeño en C puede romper A, B y D sin avisar.

---

## Patrón típico: una intención = 3 capas

```
intención del usuario: "crear sesión"
   ↓
Action:     createSessionAction(title, folderId, targetMinutes)
            → auth()
            → service.createSession(userId, ...)
            → revalidatePath
   ↓
Service:    createSession(userId, title, folderId, targetMinutes)
            → repo.findActiveByUser (idempotencia)
            → verifica folder
            → repo.create(...)
   ↓
Repository: create({ userId, folderId, title, targetMinutes })
            → prisma.studySession.create(...)
```

Una intención = 3 niveles de abstracción.

---

## Helpers que aparecerán

### `getAuthedUserId` (lib/auth-helpers.ts)

Centraliza el `auth()` repetitivo en cada action:

```ts
export async function getAuthedUserId(): Promise<string | null> {
	const session = await auth();
	return session?.user?.id ?? null;
}
```

Uso:

```ts
const userId = await getAuthedUserId();
if (!userId) return null;
// TS infiere userId como string aquí (narrowing)
```

Si mañana cambias la lógica de "estar autenticado" (rol, 2FA, rate limit), tocas un solo sitio.

---

## Patrones que verás pronto

### ActionResult (manejo de errores hacia el cliente)

Cuando una action puede fallar de forma esperada (no encontrado, sin permiso, validación), no lances excepciones — devuelve un resultado tipado:

```ts
type ActionResult<T> =
	| { success: true; data: T }
	| { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

Uso:

```ts
export async function createNoteAction(input): Promise<ActionResult<Note>> {
	const userId = await getAuthedUserId();
	if (!userId) return { success: false, error: "No autorizado" };

	const parsed = schema.safeParse(input);
	if (!parsed.success) {
		return { success: false, error: "Datos inválidos", fieldErrors: parsed.error.flatten().fieldErrors };
	}

	try {
		const note = await noteService.create(userId, parsed.data);
		revalidatePath("/notes");
		return { success: true, data: note };
	} catch (err) {
		if (err instanceof NotFoundError) return { success: false, error: "Carpeta no encontrada" };
		throw err; // errores inesperados sí burbujean
	}
}
```

### Errores tipados (lib/errors.ts)

Para que el service pueda señalar problemas de negocio sin que el repo sepa de errores HTTP:

```ts
export class AppError extends Error {}
export class NotFoundError extends AppError {}
export class ForbiddenError extends AppError {}
export class ValidationError extends AppError {}
```

Flujo:

```
Repo:     deja burbujear (o lanza error de DB)
Service:  lanza errores tipados (NotFoundError, ForbiddenError)
Action:   captura y mapea a ActionResult con mensaje amigable
```

### Validación con Zod (schemas/*.schema.ts)

```ts
// schemas/note.schema.ts
import { z } from "zod";

export const createNoteSchema = z.object({
	title: z.string().min(1).max(200),
	folderId: z.string().uuid().nullable(),
	content: z.any(), // BlockNote JSON
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
```

En la action:

```ts
const parsed = createNoteSchema.safeParse(input);
if (!parsed.success) return { success: false, error: "..." };
// parsed.data es CreateNoteInput, tipado y seguro
```

**Regla**: solo validas con Zod en la **action** (donde llega input externo). El service ya recibe `CreateNoteInput` con tipos limpios.

---

## Server Components vs Client Components

| Server Component (default) | Client Component (`"use client"`) |
|---|---|
| Puede importar services directos | NO puede importar services (lanzaría build error) |
| Puede usar `async/await` | NO puede ser async (excepto en route handlers) |
| NO puede usar `useState`, `useEffect` | Sí puede |
| NO puede tener event handlers (`onClick`) | Sí puede |
| Renderiza en servidor, se hidrata en cliente | Renderiza en servidor + cliente |

**Regla práctica**: empieza todo como Server Component. Conviértelo a Client SOLO cuando necesites interactividad (`useState`, `onClick`, `useEffect`).

**Patrón composición**: un Server Component puede importar y renderizar Client Components dentro. Lo contrario NO funciona (Client no puede importar Server directo, solo recibirlos como `children`).

### Llamar a una action desde Client Component

```tsx
"use client";
import { createNoteAction } from "@/server/notes/notes.actions";

export function NewNoteForm() {
	async function handleSubmit(formData: FormData) {
		const result = await createNoteAction({ ... });
		if (!result.success) {
			// mostrar error
		}
	}
	return <form action={handleSubmit}>...</form>;
}
```

### Llamar a un service desde Server Component (lectura)

```tsx
import * as noteService from "@/server/notes/notes.service";
import { auth } from "@/auth";

export default async function NotesPage() {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");

	const notes = await noteService.getRecent(session.user.id);
	return <NotesList notes={notes} />;
}
```

---

## Conceptos transversales

### Idempotencia

Una operación es **idempotente** si llamarla N veces tiene el mismo efecto que llamarla 1 vez.

Ejemplo en Solarium: `createSession` verifica si ya hay una `ACTIVE` y la devuelve en vez de crear otra. Si el usuario hace doble click en "Iniciar", no se crean dos sesiones.

**Cuándo aplicarla**: en cualquier mutación que el usuario pueda disparar dos veces sin querer (forms, botones), o que un cliente pueda reintentar (red intermitente).

### Defensa en profundidad

Cada capa protege a su manera:

- **Action**: pregunta `auth()` — ¿quién eres?
- **Service**: confía en el `userId` recibido — aplica reglas de negocio
- **Repository**: filtra siempre por `userId` en el `where` — solo te doy tus datos

Aunque alguien rompiera una capa, las otras te protegen. **Nunca pongas toda la seguridad en un solo sitio**.

### TypeScript narrowing

Después de un check, TS reduce el tipo automáticamente:

```ts
const userId = await getAuthedUserId(); // string | null
if (!userId) return null;
// ↓ aquí TS sabe que userId es string
service.foo(userId); // ✅
```

Esto NO es ceremonia, es defensa real. El `if` antes del return es lo que convierte `string | null` en `string`.

### Cognitive load (carga cognitiva)

> No optimices por líneas de código. Optimiza por cuántas cosas tienes que entender para hacer un cambio.

Cuando extraer un helper te da las mismas líneas totales pero **reduce lo que cada función tiene que saber**, vale la pena. Cualquier código se lee 100 veces y se escribe 1 vez.

### revalidatePath vs revalidateTag

| `revalidatePath("/notes")` | `revalidateTag("user-notes-abc")` |
|---|---|
| Invalida caché de una ruta entera | Invalida caché etiquetado |
| Más simple | Más granular |
| Default razonable | Cuando varias rutas dependen de los mismos datos |

Para Lumma hoy: usa `revalidatePath`. Migrar a tags solo cuando tengas cachés explícitos con `unstable_cache`.

---

## Convenciones de nombrado en Lumma

### Archivos

| Patrón | Para qué |
|---|---|
| `*.repository.ts` | Capa de datos |
| `*.service.ts` | Lógica de negocio |
| `*.actions.ts` (o `*-actions.ts`) | Server Actions |
| `*.schema.ts` | Schemas Zod |
| `*.types.ts` | Tipos compartidos |

### Funciones

| Patrón | Capa |
|---|---|
| `findX`, `createX`, `updateX`, `deleteX` | Repository (verbos de operación) |
| `createSession`, `completeSession`, `getStreak` | Service (verbos de caso de uso) |
| `createSessionAction`, `completeSessionAction` | Action (sufijo `Action`) |

El sufijo `Action` deja claro a la vista que algo cruza la frontera servidor-cliente.

---

## Antipatrones a evitar

❌ **`auth()` en service o repo** — solo en action

❌ **`prisma.*` en service o action** — solo en repo

❌ **`revalidatePath` en service o repo** — solo en action

❌ **Service llamando a service de otra feature con lógica de negocio** — usa la action para orquestar

❌ **Service sin `userId` como parámetro** — un service casi siempre opera en contexto de un usuario; recibe `userId`, no llames `auth()` dentro

❌ **Función del repo sin filtro `userId`** — `findById(id)` es peligroso; usa `findByIdAndUser(id, userId)`

❌ **Wrapping de lecturas en `"use server"`** — los Server Components llaman al service directo, no a una action de lectura

❌ **Componente Radix vacío** (`<Collapsible></Collapsible>`) — rompe el orden de IDs y causa hydration mismatch

❌ **`<SidebarMenuButton asChild><Link>`** — patrón Slot+Link que causa hydration mismatch en este proyecto. Usa `<Link className={sidebarMenuButtonVariants()}>` directo

---

## Crecimiento natural

Empieza simple. Refactoriza cuando duela.

| Etapa | Estructura |
|---|---|
| **Hoy** (5 features) | `server/solarium/solarium.{repository,service,actions}.ts` |
| **Mediana** (10-15 features) | Igual, pero servicios partidos por subdominio si crecen |
| **Grande** (30+ features) | Carpeta `actions/`, `services/`, `repositories/` dentro de cada feature, una función por archivo |
| **Empresarial** (Fabrika) | Capa de use cases separada, eventos, factories, builders |

No saltes etapas antes de tiempo. Lo que escala bien hoy se siente over-engineered mañana, y viceversa.

---

## Checklist mental antes de escribir una función nueva

1. ¿Qué intención del usuario representa? (te ayuda a nombrarla)
2. ¿Necesita saber quién está logueado? → action
3. ¿Toca Prisma? → repo
4. ¿Reglas de negocio? → service
5. ¿La firma exige `userId`? — si no, probablemente está mal puesta
6. ¿Devuelve null/throw cuando algo falla? — consistencia con el resto de la capa
7. ¿El nombre refleja su capa? (`xAction` para actions, verbos de DB para repo, verbos de caso de uso para service)

---

## Recursos cuando dudes

- **Plan original**: `docs/plan/` (estructura completa propuesta)
- **Handoff**: `docs/handoff.md` (estado actual y pendientes)
- **Otros conceptos**: `docs/concepts/` (Server Components, layouts, security)

---

## Mantra final

> Repository habla con la **DB**. Service habla con la **lógica**. Action habla con el **mundo exterior**.
>
> Cuando dudes: ¿con quién está hablando esta función?
