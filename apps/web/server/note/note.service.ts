import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import * as noteRepository from "./note.repository";

/**
 * Lógica de negocio para Note. Las pages la llaman directamente para
 * lecturas; las actions la llaman para mutaciones (añadiendo
 * revalidatePath donde corresponda).
 */

export function getNote(userId: string, noteId: string) {
	return noteRepository.findByIdForUser(noteId, userId);
}

export function getRecentNotes(userId: string, limit: number = 10) {
	return noteRepository.findRecentByUser(userId, limit);
}

export function searchNotes(userId: string, query: string) {
	if (!query.trim()) return Promise.resolve([]);
	return noteRepository.searchByTitle(userId, query);
}

export function getInboxCount(userId: string) {
	return noteRepository.countInbox(userId);
}

export function getInboxNotes(userId: string) {
	return noteRepository.findInboxByUser(userId);
}

export async function createNote(
	userId: string,
	input: {
		folderId: string | null;
		title: string;
		content?: string;
	},
) {
	// TODO: cuando exista folderRepository, mover a folderRepository.belongsToUser
	if (input.folderId) {
		const folder = await prisma.folder.findUnique({
			where: { id: input.folderId, userId },
			select: { id: true },
		});
		if (!folder) return null;
	}

	return noteRepository.create({
		userId,
		folderId: input.folderId,
		title: input.title,
		content: input.content ?? "",
	});
}

export async function createEmptyNoteForRedirect(
	userId: string,
	folderId: string | null,
) {
	if (folderId) {
		const folder = await prisma.folder.findUnique({
			where: { id: folderId, userId },
			select: { id: true },
		});
		if (!folder) return null;
	}

	return noteRepository.create({
		userId,
		folderId,
		title: "",
		content: {} as Prisma.InputJsonValue,
	});
}

export function updateNote(
	userId: string,
	noteId: string,
	data: { title?: string; content?: unknown },
) {
	return noteRepository.update(noteId, userId, data);
}

export async function moveNoteToFolder(
	userId: string,
	noteId: string,
	targetFolderId: string | null,
) {
	// Validar que el folder destino pertenece al user
	if (targetFolderId) {
		const folder = await prisma.folder.findUnique({
			where: { id: targetFolderId, userId },
			select: { id: true },
		});
		if (!folder) return null;
	}

	// Conocer el folder origen para que la action sepa qué paths revalidar
	const previous = await noteRepository.findFolderId(noteId, userId);
	if (!previous) return null;

	const note = await noteRepository.updateFolder(noteId, userId, targetFolderId);
	return { note, previousFolderId: previous.folderId };
}

export function deleteNote(userId: string, noteId: string) {
	return noteRepository.remove(noteId, userId);
}
