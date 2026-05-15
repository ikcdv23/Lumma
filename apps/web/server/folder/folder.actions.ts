"use server";

import { revalidatePath } from "next/cache";
import { getAuthedUserId } from "@/lib/auth-helper";
import * as folderService from "./folder.service";

/**
 * Capa fina. Solo lo que viene del cliente. Las lecturas (getFolder,
 * listFolders) vienen de Server Components → directo al service.
 */

export async function createFolderAction(name: string) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	const folder = await folderService.createFolder(userId, name);
	if (!folder) return null;

	revalidatePath("/folders");
	return folder;
}

export async function updateFolderAction(folderId: string, name: string) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	const folder = await folderService.updateFolder(userId, folderId, name);
	if (!folder) return null;

	revalidatePath("/folders");
	return folder;
}

export async function deleteFolderAction(folderId: string) {
	const userId = await getAuthedUserId();
	if (!userId) return;

	await folderService.deleteFolder(userId, folderId);
	revalidatePath("/folders");
}

/**
 * Lectura desde Client Component (MoveToFolderDialog). Existe porque el
 * Dialog se monta en cliente y necesita poblar el selector de carpetas
 * destino. Si en algún momento el padre se vuelve Server Component y
 * pasa folders como prop, esta action se puede borrar.
 */
export async function listFoldersAction() {
	const userId = await getAuthedUserId();
	if (!userId) return [];

	return folderService.listFolders(userId);
}
