import * as folderRepository from "./folder.repository";

/**
 * Lógica de negocio para Folder. Reads se llaman directo desde pages;
 * mutations pasan por la capa action.
 */

export function getFolder(userId: string, folderId: string) {
	return folderRepository.findByIdForUser(folderId, userId);
}

export function listFolders(userId: string) {
	return folderRepository.findManyByUser(userId);
}

/**
 * Variante con `notes` incluidas, pensada para el configurador de sesión
 * Solarium. Devuelve un shape específico para `<SessionConfig>`.
 */
export function listFoldersWithNotes(userId: string) {
	return folderRepository.findManyByUserWithNotes(userId);
}

export function countNotes(userId: string, folderId: string) {
	return folderRepository.countNotes(folderId, userId);
}

export async function createFolder(userId: string, name: string) {
	const trimmed = name.trim();
	if (!trimmed) return null;
	return folderRepository.create({ userId, name: trimmed });
}

export async function updateFolder(
	userId: string,
	folderId: string,
	name: string,
) {
	const trimmed = name.trim();
	if (!trimmed) return null;
	return folderRepository.update(folderId, userId, trimmed);
}

export function deleteFolder(userId: string, folderId: string) {
	return folderRepository.remove(folderId, userId);
}

/**
 * Para uso cross-feature (ej. Solarium valida que todos los folderIds
 * pertenezcan al user antes de crear una sesión).
 */
export function countOwnedByUser(userId: string, folderIds: string[]) {
	return folderRepository.countOwnedByUser(folderIds, userId);
}
