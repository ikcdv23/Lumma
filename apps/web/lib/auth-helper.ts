import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Devuelve el id del usuario autenticado o null.
 * Centraliza el patrón `auth() + early return` que se repite en cada action.
 *
 * Para casos donde quieres manejar el "no autenticado" manualmente
 * (típicamente actions que devuelven `null` o un ActionResult de error al cliente).
 *
 * Cambia aquí si en el futuro necesitas verificar rol, 2FA o rate limiting.
 */
export async function getAuthedUserId(): Promise<string | null> {
	const session = await auth();
	return session?.user?.id ?? null;
}

/**
 * Devuelve el id del usuario autenticado, o redirige a /login si no lo está.
 *
 * El return type es `string` (no nullable) porque `redirect()` tiene return type `never`:
 * TypeScript entiende que si no hay user, el código de abajo no se ejecuta.
 *
 * Pensado para Server Components donde si no hay user, la respuesta es siempre
 * "ir a login" y no merece la pena el `if` boilerplate en cada page.
 */
export async function requireAuthedUserId(): Promise<string> {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");
	return session.user.id;
}
