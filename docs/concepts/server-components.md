# Server Components vs Client Components

## Server Components (por defecto en App Router)

- Se ejecutan en el **servidor**, no en el navegador
- Pueden ser `async` y hacer `await` directamente (ej: `await auth()`)
- Pueden acceder a la base de datos, variables de entorno, etc.
- **NO pueden** usar eventos del navegador (`onClick`, `onChange`, etc.)
- **NO pueden** usar hooks de React (`useState`, `useEffect`, etc.)

## Client Components

- Se ejecutan en el **navegador**
- Se marcan con `"use client"` al inicio del archivo
- Pueden usar eventos y hooks
- No pueden ser `async` ni acceder directamente al servidor

## Server Actions

Cuando necesitas ejecutar codigo del servidor desde un click del usuario, usas **server actions**:

```tsx
<form
  action={async () => {
    "use server";
    await signOut();
  }}
>
  <button type="submit">Cerrar sesion</button>
</form>
```

- `"use server"` marca la funcion como server action
- Se ejecuta en el servidor cuando se envia el formulario
- Es la alternativa a `onClick` cuando estas en un Server Component

## Error comun

```
Event handlers cannot be passed to Client Component props.
```

Esto pasa si intentas usar `onClick` en un Server Component. Solucion: usar un form con server action, o convertir el componente a Client Component con `"use client"`.
