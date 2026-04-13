# Plan: Clean Architecture para Lumma

## Estado: En pausa

Decidimos pausar la reestructuracion hasta que la app funcione de punta a punta (login → home → usar la app). No tiene sentido organizar capas sin tener features reales que organizar.

## Por que Clean Architecture

El codigo actual vive todo plano en `apps/web/`. Funciona, pero cuando empecemos a anadir CRUD de carpetas y notas, sin estructura cada archivo nuevo sera un "donde pongo esto?".

La idea es separar en capas:

```
UI (paginas, componentes)
    ↓
Actions (server actions — reciben datos del usuario)
    ↓
Services (logica de negocio — reglas y validaciones)
    ↓
Repositories (queries a la base de datos)
    ↓
Database (PostgreSQL)
```

## Principios

1. **El UI nunca toca la DB directamente** — siempre pasa por capas intermedias
2. **Cada capa tiene una responsabilidad clara** — sabes donde buscar cada cosa
3. **Testeabilidad** — la estructura permite agregar tests facilmente despues
4. **Solo lo necesario** — nada de over-engineering enterprise

## Que NO incluye (a proposito)

- No dependency injection container — imports directos, somos un solo dev
- No interfaces abstractas para repos — overkill para este proyecto
- No clases "domain entity" separadas — los tipos de Prisma son suficientes

## Estructura propuesta

```
apps/web/
├── app/                    # Routing (Next.js App Router)
│   ├── (auth)/             # Paginas sin autenticar
│   ├── (dashboard)/        # App autenticada
│   └── api/
│
├── server/                 # Logica server-side
│   ├── actions/            # Server Actions (capa "controlador")
│   ├── services/           # Logica de negocio
│   ├── repositories/       # Queries Prisma
│   └── auth.ts             # Config de NextAuth
│
├── schemas/                # Validacion con Zod
├── types/                  # Tipos TypeScript compartidos
├── lib/                    # Utilidades (prisma.ts, utils.ts)
├── components/             # UI
│   ├── ui/                 # Shadcn primitivos
│   ├── shared/             # Componentes reutilizables
│   ├── folders/            # Componentes del feature folders
│   └── notes/              # Componentes del feature notes
└── hooks/                  # Hooks client-side
```

## Proximos pasos

Antes de implementar esta estructura:

1. Crear pagina `/home` para que el flujo de auth funcione completo
2. Tener al menos un feature real (CRUD de carpetas)
3. Entonces aplicar la estructura, moviendo codigo existente a sus capas

## Decisiones relacionadas

- [[../decisions/zod-validation|Zod para validacion]] (pendiente de implementar)
