# Seguridad: account enumeration

## El problema

Cuando un usuario intenta registrarse con un email ya existente, es comun devolver:

> "Este email ya esta registrado"

**Eso filtra informacion**. Un atacante puede usar el formulario de registro como herramienta de reconocimiento: prueba millones de emails y descubre cuales tienen cuenta en tu sistema.

Esto se llama **account enumeration** (enumeracion de cuentas).

## Por que importa

Saber que un email tiene cuenta abre la puerta a:

- **Ataques dirigidos**: phishing personalizado contra esos usuarios
- **Credential stuffing**: probar contraseñas filtradas de otras brechas en cuentas confirmadas
- **Spam dirigido**: bombardear solo emails verificados

El registro no es el unico sitio donde puede pasar — tambien en:

- Login: "Email no encontrado" vs "Contraseña incorrecta"
- Recuperar contraseña: "Email no existe" vs "Te enviamos un correo"

## Soluciones

### En registro

Usar un mensaje neutro:

> "No se pudo crear la cuenta. Verifica tus datos e intenta de nuevo."

O mejor: **enviar un email** al usuario diciendole que ya tiene cuenta, y mostrar siempre el mismo mensaje al frontend ("Te enviamos un email de confirmacion"). Asi el atacante nunca sabe si el email existe.

### En login

Mensaje generico:

> "Email o contraseña incorrectos"

(No diferenciar entre "email no existe" y "contraseña mal")

### En recuperar contraseña

Siempre el mismo mensaje:

> "Si el email existe, te hemos enviado instrucciones para recuperar tu cuenta"

(Aunque internamente solo envies el email si la cuenta existe)

## Cuando aplicar esto

- **App publica con datos sensibles** (banca, salud, identidad): si o si
- **App publica sin datos especialmente sensibles** (notas, blogs): recomendado pero no critico
- **App interna o de aprendizaje**: opcional

Lumma cae en la segunda categoria — no es critico pero es buena practica.

## Trade-off de UX

El mensaje neutro empeora la experiencia del usuario legitimo: si pone un email mal escrito, no sabra si es porque ya tiene cuenta o porque hay otro error. Es un trade-off entre seguridad y UX.

Lo que hacen las apps grandes (Gmail, Twitter, etc): mensaje neutro **siempre**, y comunicacion adicional por email para guiar al usuario sin revelar nada al frontend.
