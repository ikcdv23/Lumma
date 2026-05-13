import { auth } from "@/auth";

/**
 * Devuelve el id del usuario autenticado o null.
 * Centraliza el patrón `auth() + early return` que se repite en cada action.
 *
 * Cambia aquí si en el futuro necesitas verificar rol, 2FA o rate limiting.
 */
export async function getAuthedUserId(): Promise<string | null> {
	const session = await auth();
	return session?.user?.id ?? null;
}
