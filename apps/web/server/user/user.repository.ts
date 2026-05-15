import { prisma } from "@/lib/prisma";

/**
 * Capa de datos para User. La autenticación (signIn/signOut de NextAuth)
 * vive en server/auth/. Aquí solo hay queries CRUD del modelo User.
 */

export function findById(userId: string) {
	return prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			password: true,
			createdAt: true,
		},
	});
}

export function findByEmail(email: string) {
	return prisma.user.findUnique({ where: { email } });
}

export function findPasswordHashById(userId: string) {
	return prisma.user.findUnique({
		where: { id: userId },
		select: { password: true },
	});
}

export function create(data: {
	name: string;
	email: string;
	hashedPassword: string;
}) {
	return prisma.user.create({
		data: {
			name: data.name,
			email: data.email,
			password: data.hashedPassword,
		},
	});
}

export function updateName(userId: string, name: string) {
	return prisma.user.update({
		where: { id: userId },
		data: { name },
	});
}

export function updatePassword(userId: string, hashedPassword: string) {
	return prisma.user.update({
		where: { id: userId },
		data: { password: hashedPassword },
	});
}

export function remove(userId: string) {
	return prisma.user.delete({ where: { id: userId } });
}
