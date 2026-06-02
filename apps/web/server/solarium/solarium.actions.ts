"use server";

import { revalidatePath } from "next/cache";
import { getAuthedUserId } from "@/lib/auth-helper";
import * as solariumService from "./solarium.service";

export async function createSessionAction(input: {
	title: string | null;
	folderIds: string[];
	noteIds: string[];
	targetMinutes: number;
}) {
	const userId = await getAuthedUserId();
	if (!userId) return { ok: false as const, reason: "unauthorized" as const };

	const result = await solariumService.createSession(userId, input);

	if (result.ok && result.created) {
		revalidatePath("/solarium");
	}
	return result;
}

export async function heartbeatAction(sessionId: string) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	return await solariumService.heartbeat(userId, sessionId);
}

export async function abandonSessionAction(
	sessionId: string,
	studyMinutes: number,
	breakMinutes: number,
) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	await solariumService.abandonSession(
		userId,
		sessionId,
		studyMinutes,
		breakMinutes,
	);

	revalidatePath("/solarium");
}

export async function completeSessionAction(
	sessionId: string,
	studyMinutes: number,
	breakMinutes: number,
) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	await solariumService.completeSession(
		userId,
		sessionId,
		studyMinutes,
		breakMinutes,
	);

	revalidatePath("/solarium");
}

export async function createNoteInActiveSessionAction() {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	const newNote = await solariumService.createNoteInActiveSession(userId);

	revalidatePath("/active");
	return newNote;
}

export async function createFolderInActiveSessionAction() {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	const newFolder = await solariumService.createFolderInActiveSession(userId);

	revalidatePath("/active");
	return newFolder;
}

export async function detachFolderFromActiveSessionAction(folderId: string) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	const detached = await solariumService.detachFolderFromActiveSession(
		userId,
		folderId,
	);

	revalidatePath("/active");
	return detached;
}