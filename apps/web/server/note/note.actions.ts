"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthedUserId } from "@/lib/auth-helper";
import * as noteService from "./note.service";

/**
 * Capa fina entre cliente y service. Cada action:
 * 1) Resuelve userId
 * 2) Llama al service
 * 3) Revalida los paths que cambiaron
 *
 * Las lecturas (getNote, getInboxNotes, etc.) NO viven aquí — las Server
 * Components llaman directamente a noteService. No cruzan frontera
 * cliente↔servidor, así que la action sería ruido.
 */

export async function createNoteAction(
	folderId: string | null,
	title: string,
	content: string = "",
) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	const note = await noteService.createNote(userId, { folderId, title, content });
	if (!note) return null;

	revalidatePath(folderId ? `/folders/${folderId}` : "/home");
	return note;
}

export async function updateNoteAction(
	noteId: string,
	data: { title?: string; content?: unknown },
) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	const note = await noteService.updateNote(userId, noteId, data);
	revalidatePath(note.folderId ? `/folders/${note.folderId}` : "/home");
	return note;
}

export async function moveNoteToFolderAction(
	noteId: string,
	targetFolderId: string | null,
) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	const result = await noteService.moveNoteToFolder(userId, noteId, targetFolderId);
	if (!result) return null;

	revalidatePath(
		result.previousFolderId ? `/folders/${result.previousFolderId}` : "/inbox",
	);
	revalidatePath(targetFolderId ? `/folders/${targetFolderId}` : "/inbox");
	revalidatePath("/home");
	return result.note;
}

export async function deleteNoteAction(noteId: string) {
	const userId = await getAuthedUserId();
	if (!userId) return;

	const note = await noteService.deleteNote(userId, noteId);
	revalidatePath(note.folderId ? `/folders/${note.folderId}` : "/home");
}

export async function searchNotesAction(query: string) {
	const userId = await getAuthedUserId();
	if (!userId) return [];

	return noteService.searchNotes(userId, query);
}

/**
 * Crea una nota vacía y redirige al editor. La llama el botón "Nueva nota"
 * del notes-grid (Client Component con form action). Por eso es action y
 * no service directo.
 */
export async function createNoteAndRedirectAction(folderId: string | null) {
	const userId = await getAuthedUserId();
	if (!userId) return;

	const note = await noteService.createEmptyNoteForRedirect(userId, folderId);
	if (!note) return;

	revalidatePath(folderId ? `/folders/${folderId}` : "/home");
	redirect(`/notes/${note.id}`);
}
