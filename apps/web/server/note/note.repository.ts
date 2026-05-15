import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Capa de acceso a datos para Note. Cero auth, cero lógica de negocio:
 * solo queries Prisma filtradas por userId.
 *
 * Las funciones aceptan userId como argumento — la responsabilidad de
 * resolverlo desde la sesión vive en la capa de service/action.
 */

export function findByIdForUser(noteId: string, userId: string) {
	return prisma.note.findUnique({
		where: { id: noteId, userId },
	});
}

export function findRecentByUser(userId: string, limit: number = 10) {
	return prisma.note.findMany({
		where: { userId },
		orderBy: { updatedAt: "desc" },
		take: limit,
		include: {
			folder: { select: { name: true } },
		},
	});
}

export function searchByTitle(
	userId: string,
	query: string,
	limit: number = 20,
) {
	return prisma.note.findMany({
		where: {
			userId,
			title: { contains: query, mode: "insensitive" },
		},
		orderBy: { updatedAt: "desc" },
		take: limit,
	});
}

export function countInbox(userId: string) {
	return prisma.note.count({
		where: { userId, folderId: null },
	});
}

export function countOwnedByUser(noteIds: string[], userId: string) {
	if (noteIds.length === 0) return Promise.resolve(0);
	return prisma.note.count({
		where: { id: { in: noteIds }, userId },
	});
}

export function countByUser(userId: string) {
	return prisma.note.count({ where: { userId } });
}

export function findInboxByUser(userId: string) {
	return prisma.note.findMany({
		where: { userId, folderId: null },
		orderBy: { updatedAt: "desc" },
	});
}

export function create(data: {
	userId: string;
	folderId: string | null;
	title: string;
	content: Prisma.InputJsonValue | string;
}) {
	return prisma.note.create({
		data: {
			userId: data.userId,
			folderId: data.folderId,
			title: data.title,
			content: data.content as Prisma.InputJsonValue,
		},
	});
}

/**
 * Crea una nota vacía y la conecta a una StudySession existente (M:N).
 * Centraliza el patrón que antes vivía inline en solarium.actions.
 */
export function createForSession(data: { userId: string; sessionId: string }) {
	return prisma.note.create({
		data: {
			userId: data.userId,
			title: "",
			content: {},
			studySessions: { connect: { id: data.sessionId } },
		},
		select: { id: true },
	});
}

export function update(
	noteId: string,
	userId: string,
	data: { title?: string; content?: unknown },
) {
	return prisma.note.update({
		where: { id: noteId, userId },
		data: data as Prisma.NoteUpdateInput,
	});
}

export function updateFolder(
	noteId: string,
	userId: string,
	targetFolderId: string | null,
) {
	return prisma.note.update({
		where: { id: noteId, userId },
		data: { folderId: targetFolderId },
	});
}

export function findFolderId(noteId: string, userId: string) {
	return prisma.note.findUnique({
		where: { id: noteId, userId },
		select: { folderId: true },
	});
}

export function remove(noteId: string, userId: string) {
	return prisma.note.delete({
		where: { id: noteId, userId },
	});
}
