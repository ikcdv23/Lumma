"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
	updateNameSchema,
	updatePasswordSchema,
} from "@/schemas/user.schema";

export async function getProfile() {
	const session = await auth();
	if (!session?.user?.id) return null;

	const [user, foldersCount, notesCount] = await Promise.all([
		prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				password: true,
				createdAt: true,
			},
		}),
		prisma.folder.count({ where: { userId: session.user.id } }),
		prisma.note.count({ where: { userId: session.user.id } }),
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

export async function updateName(formData: FormData) {
	const session = await auth();
	if (!session?.user?.id) return { error: "No autenticado" };

	const parsed = updateNameSchema.safeParse({
		name: formData.get("name"),
	});

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
	}

	await prisma.user.update({
		where: { id: session.user.id },
		data: { name: parsed.data.name },
	});

	revalidatePath("/profile");
	return { success: true };
}

export async function updatePassword(formData: FormData) {
	const session = await auth();
	if (!session?.user?.id) return { error: "No autenticado" };

	const parsed = updatePasswordSchema.safeParse({
		currentPassword: formData.get("currentPassword"),
		newPassword: formData.get("newPassword"),
		confirmPassword: formData.get("confirmPassword"),
	});

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Datos invalidos" };
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { password: true },
	});

	if (!user?.password) {
		return { error: "Esta cuenta no tiene contraseña configurada" };
	}

	const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
	if (!valid) {
		return { error: "La contraseña actual no es correcta" };
	}

	const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
	await prisma.user.update({
		where: { id: session.user.id },
		data: { password: newHash },
	});

	return { success: true };
}
