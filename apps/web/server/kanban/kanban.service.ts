import type { KanbanStatus } from "@/generated/prisma/client";
import * as kanbanRepository from "./kanban.repository";

const TITLE_MAX = 200;

export function listCardsBySession(sessionId: string, userId: string) {
	return kanbanRepository.findAllBySession(sessionId, userId);
}

export async function createCard(
	userId: string,
	sessionId: string,
	title: string,
	status: KanbanStatus = "PENDING",
) {
	const trimmed = title.trim();
	if (!trimmed) return null;
	if (trimmed.length > TITLE_MAX) return null;

	// Validar que la sesión existe y pertenece al user antes de adjuntar el
	// card. Sin esto, un cliente malicioso podría meter cards en la sesión
	// de otro user pasando un sessionId arbitrario.
	const session = await kanbanRepository.sessionBelongsToUser(sessionId, userId);
	if (!session) return null;

	return kanbanRepository.create({ studySessionId: sessionId, title: trimmed, status });
}

export async function moveCard(
	userId: string,
	cardId: string,
	status: KanbanStatus,
) {
	return kanbanRepository.updateStatus(cardId, userId, status);
}

export async function renameCard(
	userId: string,
	cardId: string,
	title: string,
) {
	const trimmed = title.trim();
	if (!trimmed) return null;
	if (trimmed.length > TITLE_MAX) return null;
	return kanbanRepository.updateTitle(cardId, userId, trimmed);
}

export function deleteCard(userId: string, cardId: string) {
	return kanbanRepository.remove(cardId, userId);
}
