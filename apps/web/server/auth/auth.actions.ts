"use server";

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

	await signIn("credentials", {
		email,
		password,
		redirectTo: "/home",
	});
}
