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
	if (!userId) return null;

	const created = await solariumService.createSession(userId, input);

	revalidatePath("/solarium");
	return created;
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
