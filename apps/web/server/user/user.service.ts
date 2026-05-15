import bcrypt from "bcrypt";
import * as userRepository from "./user.repository";
import * as folderRepository from "@/server/folder/folder.repository";
import * as noteRepository from "@/server/note/note.repository";

export type ProfileResult = {
	id: string;
	name: string | null;
	email: string | null;
	image: string | null;
	hasPassword: boolean;
	createdAt: Date;
	stats: { foldersCount: number; notesCount: number };
};

/**
 * Devuelve el perfil del user con stats agregadas. Las counts vienen de
 * los repos de folder/note — cross-feature READS están permitidas desde
 * cualquier service.
 */
export async function getProfile(userId: string): Promise<ProfileResult | null> {
	const [user, foldersCount, notesCount] = await Promise.all([
		userRepository.findById(userId),
		folderRepository.countByUser(userId),
		noteRepository.countByUser(userId),
	]);

	if (!user) return null;

	return {
		id: user.id,
		name: user.name,
		email: user.email,
		image: user.image,
		hasPassword: Boolean(user.password),
		createdAt: user.createdAt,
		stats: { foldersCount, notesCount },
	};
}

export async function updateUserName(userId: string, name: string) {
	return userRepository.updateName(userId, name);
}

/**
 * Result discriminado para que la action sepa qué responder al cliente
 * sin ambigüedad.
 */
export type UpdatePasswordResult =
	| { ok: true }
	| { ok: false; error: string };

export async function changePassword(
	userId: string,
	currentPassword: string,
	newPassword: string,
): Promise<UpdatePasswordResult> {
	const user = await userRepository.findPasswordHashById(userId);
	if (!user?.password) {
		return { ok: false, error: "Esta cuenta no tiene contraseña configurada" };
	}

	const valid = await bcrypt.compare(currentPassword, user.password);
	if (!valid) {
		return { ok: false, error: "La contraseña actual no es correcta" };
	}

	const newHash = await bcrypt.hash(newPassword, 10);
	await userRepository.updatePassword(userId, newHash);
	return { ok: true };
}

export type DeleteAccountResult =
	| { ok: true }
	| { ok: false; error: string };

export async function deleteAccount(
	userId: string,
	password: string,
): Promise<DeleteAccountResult> {
	const user = await userRepository.findPasswordHashById(userId);
	if (!user) return { ok: false, error: "Usuario no encontrado" };

	if (user.password) {
		if (!password) {
			return { ok: false, error: "Debes introducir tu contraseña actual" };
		}
		const valid = await bcrypt.compare(password, user.password);
		if (!valid) return { ok: false, error: "Contraseña incorrecta" };
	}

	await userRepository.remove(userId);
	return { ok: true };
}

export type RegisterResult =
	| { ok: true }
	| { ok: false; error: string };

export async function register(input: {
	name: string;
	email: string;
	password: string;
}): Promise<RegisterResult> {
	const existing = await userRepository.findByEmail(input.email);
	if (existing) {
		// Mensaje neutro intencionado: ver concepts/security-account-enumeration
		return { ok: false, error: "No se pudo crear la cuenta" };
	}

	const hashed = await bcrypt.hash(input.password, 10);
	await userRepository.create({
		name: input.name,
		email: input.email,
		hashedPassword: hashed,
	});
	return { ok: true };
}
