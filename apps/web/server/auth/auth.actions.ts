"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn, signOut } from "@/auth";

/**
 * Wrappers finos sobre NextAuth. No tocan BD — la auth es responsabilidad
 * de NextAuth, esta capa solo expone signIn/signOut a Client Components
 * (que no pueden importar `signIn`/`signOut` de NextAuth directamente).
 *
 * El registro (crear nuevo user) vive en server/user/user.actions.ts
 * porque conceptualmente es "crear una entidad User", no "autenticar".
 */

export async function signOutAction() {
	await signOut({ redirectTo: "/login" });
}

export async function loginAction(_prevState: unknown, formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!email || !password) {
		return { error: "Email y contraseña requeridos" };
	}

	try {
		await signIn("credentials", {
			email,
			password,
			redirectTo: "/home",
		});
	} catch (error) {
		// El redirect de éxito viaja como excepción NEXT_REDIRECT —
		// hay que dejarlo pasar para que Next complete la navegación.
		if (isRedirectError(error)) throw error;
		// Credenciales inválidas u otro AuthError de NextAuth → mensaje al form.
		if (error instanceof AuthError) {
			return { error: "Email o contraseña incorrectos" };
		}
		// Error desconocido (BD caída, etc.): que burbujee.
		throw error;
	}
}
