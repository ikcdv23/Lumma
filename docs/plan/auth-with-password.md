# Plan: Auth con contraseña + verificacion por email

## Estado actual

Hecho:
- Campo `password String?` añadido al modelo User
- Migracion aplicada (`add-password-field`)
- bcrypt y zod instalados
- Server action `manualSignin` creada en `server/actions/auth-actions.ts`
- Form de registro conectado a la action (en `(auth)/register/page.tsx`)

Pendiente: validar con Zod, login con credentials, verificacion por email con Mailtrap.

---

## Paso 2: Crear el schema de Zod

Crear el archivo `apps/web/schemas/auth.schema.ts` (la carpeta `schemas/` no existe, creala):

```typescript
import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    email: z.string().email("El formato del email no es valido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
```

### Que hace cada cosa

- `z.object({...})` — define un objeto con sus campos
- `z.string().email("mensaje")` — encadena validaciones; los strings son mensajes de error custom
- `.refine(fn, opts)` — para validaciones que cruzan campos (ej: dos contraseñas coinciden)
- `z.infer<typeof registerSchema>` — TypeScript infiere el tipo desde el schema

---

## Paso 3: Usar el schema en la action

Reemplazar las validaciones manuales en `server/actions/auth-actions.ts`:

```typescript
"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { redirect } from "next/navigation"
import { registerSchema } from "@/schemas/auth.schema"

export async function manualSignin(formData: FormData) {
    const rawInput = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    // Validacion con Zod
    const result = registerSchema.safeParse(rawInput);
    if (!result.success) {
        // result.error.issues es un array con todos los errores
        // Devuelve el primero por simplicidad
        return { error: result.error.issues[0].message };
    }

    const { name, email, password } = result.data;

    // Comprobar que el email no existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return { error: "No se pudo crear la cuenta" };  // mensaje neutro (ver concepts/security-account-enumeration)
    }

    // Hashear y crear
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
        data: { name, email, password: hashedPassword },
    });

    redirect("/login")
}
```

### Por que `safeParse` y no `parse`

- `parse()` — si falla, lanza una excepcion. Habria que envolverlo en try/catch.
- `safeParse()` — devuelve `{ success: true, data }` o `{ success: false, error }`. Mas limpio en server actions porque puedes manejar el error como un valor normal.

### Que devuelve `result.error`

`result.error.issues` es un array de issues, cada uno con:
- `message`: el texto de error
- `path`: el campo que fallo (ej: `["email"]`)
- `code`: el tipo de error (ej: `invalid_string`)

Por ahora devolvemos el primero. Mas adelante podriamos devolver todos por campo (ver `fieldErrors` en el plan de Clean Architecture).

---

## Paso 4: Login con credentials provider

Una vez el registro funcione, hay que poder loguearse. NextAuth tiene un Credentials Provider para email + password.

### 4.1 Modificar `auth.ts`

Añadir el provider en `apps/web/auth.ts`:

```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({ /* ...lo que ya tienes... */ }),
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await prisma.user.findUnique({ where: { email } });
                if (!user || !user.password) return null;

                const ok = await bcrypt.compare(password, user.password);
                if (!ok) return null;

                return user;
            },
        }),
    ],
    session: { strategy: "jwt" },  // Credentials provider requiere JWT
});
```

### Por que `session: jwt`

El Credentials Provider de NextAuth **no soporta** sesiones en DB (las que usa el adapter de Prisma por defecto). Hay que cambiar a JWT — la sesion se guarda firmada en una cookie en el navegador.

### 4.2 Conectar el form de login

En `app/(auth)/login/page.tsx`:

```tsx
import { signIn } from "@/auth";

// Form de email/password:
<form
  action={async (formData: FormData) => {
    "use server";
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/home",
    });
  }}
>
  {/* inputs con name="email" y name="password" */}
</form>
```

Quitar `disabled` de los inputs y del button. Manejar errores como en el registro.

---

## Paso 5: Verificacion por email con Mailtrap

### 5.1 Instalar nodemailer

```bash
pnpm add nodemailer --filter web
pnpm add -D @types/nodemailer --filter web
```

### 5.2 Configurar credenciales en `.env.local` y `.env`

Mailtrap te da estas variables (busca "SMTP credentials" en tu sandbox):

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu-usuario-de-mailtrap
SMTP_PASS=tu-password-de-mailtrap
```

### 5.3 Crear servicio de email

En `apps/web/server/services/email.service.ts`:

```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;
  await transporter.sendMail({
    from: '"Lumma" <noreply@lumma.app>',
    to,
    subject: "Verifica tu cuenta",
    html: `<p>Haz click <a href="${url}">aqui</a> para verificar tu cuenta.</p>`,
  });
}
```

### 5.4 Generar token al registrar

Modificar `manualSignin` en `auth-actions.ts`:

```typescript
import crypto from "crypto";
import { sendVerificationEmail } from "@/server/services/email.service";

// Despues de crear el usuario:
const token = crypto.randomBytes(32).toString("hex");
const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

await prisma.verificationToken.create({
    data: {
        identifier: email,
        token,
        expires,
    },
});

await sendVerificationEmail(email, token);

redirect("/login?check=email");  // mostrar mensaje "revisa tu email"
```

### 5.5 Crear pagina de verificacion

En `app/verify/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <p>Token invalido</p>;
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return <p>Token expirado o invalido</p>;
  }

  // Marcar email como verificado
  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  // Borrar el token
  await prisma.verificationToken.delete({
    where: { token },
  });

  redirect("/login?verified=1");
}
```

### 5.6 Bloquear login si no esta verificado

En el `authorize` del Credentials provider de `auth.ts`:

```typescript
if (!user.emailVerified) return null;  // o lanzar error custom
```

---

## Verificacion final

Despues de cada paso:
- `pnpm check-types` — sin errores de TypeScript
- `pnpm lint` — sin warnings
- Probar manualmente el flujo

Flujo completo:
1. Registro → email a Mailtrap → click → cuenta verificada → login → home

---

## Decisiones tomadas

- **Mailtrap Sandbox** en vez de servicio real (sin dominio, gratis, ideal para aprender)
- **8 caracteres minimo** de contraseña
- **Mensaje neutro** al detectar email duplicado (ver `concepts/security-account-enumeration`)
- **Zod** para validacion (vs validators manuales)
- **JWT sessions** porque Credentials provider lo requiere
