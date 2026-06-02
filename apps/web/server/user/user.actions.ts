"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthedUserId } from "@/lib/auth-helper";
import {
	deleteAccountSchema,
	updateNameSchema,
	updatePasswordSchema,
} from "@/schemas/user.schema";
import { registerSchema } from "@/schemas/auth.schema";
import * as userService from "./user.service";

/**
 * Lectura llamada solo desde la page de perfil (Server Component).
 * Idealmente sería llamada directa al service, pero la mantenemos como
 * action porque ahorra un import extra en la page y la convención del
 * resto del feature seguirá una vez la migración avance.
 *
 * TODO: cuando se confirme que solo Server Components la usan, mover a
 * llamada directa al service y eliminar esta action.
 */
export async function getProfileAction() {
	const userId = await getAuthedUserId();
	if (!userId) return null;
	return userService.getProfile(userId);
}

export async function updateNameAction(formData: FormData) {
	const userId = await getAuthedUserId();
	if (!userId) return { error: "No autenticado" };

	const parsed = updateNameSchema.safeParse({
		name: formData.get("name"),
	});
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
	}

	await userService.updateUserName(userId, parsed.data.name);
	revalidatePath("/profile");
	revalidatePath("/", "layout");
	return { success: true };
}

export async function updatePasswordAction(formData: FormData) {
	const userId = await getAuthedUserId();
	if (!userId) return { error: "No autenticado" };

	const parsed = updatePasswordSchema.safeParse({
		currentPassword: formData.get("currentPassword"),
		newPassword: formData.get("newPassword"),
		confirmPassword: formData.get("confirmPassword"),
	});
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
	}

	const result = await userService.changePassword(
		userId,
		parsed.data.currentPassword,
		parsed.data.newPassword,
	);
	if (!result.ok) return { error: result.error };
	return { success: true };
}

export async function deleteAccountAction(formData: FormData) {
	const userId = await getAuthedUserId();
	if (!userId) return { error: "No autenticado" };

	const parsed = deleteAccountSchema.safeParse({
		password: formData.get("password") ?? "",
		confirmation: formData.get("confirmation") ?? "",
	});
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
	}

	const result = await userService.deleteAccount(userId, parsed.data.password);
	if (!result.ok) return { error: result.error };

	// Limpieza explícita de cookies en vez de delegar en signOut: el user ya
	// no existe en BD, y signOut() reentra al callback de auth que ve un user
	// inexistente y devuelve null, lo que a veces dejaba la cookie a medias.
	// Borrar a mano + redirect es el camino fiable.
	const cookieStore = await cookies();
	const authCookies = [
		"authjs.session-token",
		"authjs.csrf-token",
		"authjs.callback-url",
		"__Secure-authjs.session-token",
		"__Secure-authjs.csrf-token",
		"__Secure-authjs.callback-url",
	];
	for (const name of authCookies) {
		cookieStore.delete(name);
	}

	redirect("/login");
}

/**
 * Registro de nuevo user. Recibe `prevState` por el patrón useActionState
 * en `<RegisterForm />`.
 */
export async function registerAction(
	_prevState: unknown,
	formData: FormData,
) {
	const parsed = registerSchema.safeParse({
		name: formData.get("name"),
		email: formData.get("email"),
		password: formData.get("password"),
		confirmPassword: formData.get("confirmPassword"),
	});
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
	}

	const { name, email, password } = parsed.data;
	const result = await userService.register({ name, email, password });
	if (!result.ok) return { error: result.error };

	redirect("/login");
}
