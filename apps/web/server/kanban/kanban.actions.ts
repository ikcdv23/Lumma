"use server";

import { revalidatePath } from "next/cache";
import type { KanbanStatus } from "@/generated/prisma/client";
import { getAuthedUserId } from "@/lib/auth-helper";
import * as kanbanService from "./kanban.service";

export async function createKanbanCardAction(
	sessionId: string,
	title: string,
	status: KanbanStatus = "PENDING",
) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	const card = await kanbanService.createCard(userId, sessionId, title, status);
	if (!card) return null;

	revalidatePath("/active");
	return card;
}

export async function moveKanbanCardAction(
	cardId: string,
	status: KanbanStatus,
) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	await kanbanService.moveCard(userId, cardId, status);
	revalidatePath("/active");
	return { ok: true as const };
}

export async function renameKanbanCardAction(cardId: string, title: string) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	const result = await kanbanService.renameCard(userId, cardId, title);
	if (!result) return null;

	revalidatePath("/active");
	return { ok: true as const };
}

export async function deleteKanbanCardAction(cardId: string) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	await kanbanService.deleteCard(userId, cardId);
	revalidatePath("/active");
	return { ok: true as const };
}
