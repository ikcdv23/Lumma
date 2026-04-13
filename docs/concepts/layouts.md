# Layouts en Next.js App Router

## Que es un layout

Un `layout.tsx` es un componente que **envuelve** a todas las paginas dentro de su carpeta. Se renderiza una vez y persiste entre navegaciones.

## Como funciona

```tsx
export default function MiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav>Sidebar o navegacion</nav>
      <main>{children}</main>  {/* ← aqui Next.js inyecta el page.tsx */}
    </div>
  );
}
```

- `children` es lo que Next.js reemplaza con el contenido del `page.tsx` de cada ruta
- El layout **no se re-renderiza** al navegar entre paginas — solo cambia `children`

## Anidamiento

Los layouts se anidan automaticamente:

```
app/layout.tsx              ← html, body, fuentes (GLOBAL)
  └── app/(workspace)/layout.tsx   ← sidebar (solo rutas autenticadas)
        └── app/(workspace)/home/page.tsx  ← contenido de la pagina
```

## Route Groups

Las carpetas con parentesis `(nombre)` son **route groups**:

- Organizan el codigo sin afectar la URL
- `app/(workspace)/home/page.tsx` → URL: `/home` (sin "workspace")
- `app/(auth)/login/page.tsx` → URL: `/login` (sin "auth")
- Permiten tener layouts diferentes para cada grupo

## Navegacion entre paginas

Next.js usa el componente `Link` de `next/link`:

```tsx
import Link from "next/link";

<Link href="/home">Inicio</Link>
```

- No recarga la pagina entera (como haria `<a href>`)
- Solo descarga el contenido del nuevo `page.tsx` por detras
- El layout se mantiene — por eso el sidebar no parpadea
- No es SPA, pero se siente como una gracias a este comportamiento hibrido

## asChild en Shadcn

Cuando quieres que un componente de Shadcn (como `SidebarMenuButton`) sea un link:

```tsx
<SidebarMenuButton asChild>
  <Link href="/home">
    <Home />
    <span>Inicio</span>
  </Link>
</SidebarMenuButton>
```

- `asChild` le dice: "no renderices tu propio elemento, usa el hijo directo"
- **Solo puede tener UN hijo directo** — el `<Link>`. Dentro del Link puedes meter lo que quieras
- Si pones dos hijos directos, da error: `React.Children.only expected a single child`
