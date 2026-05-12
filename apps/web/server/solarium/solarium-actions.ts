"use server";

import * as solariumService from "./solarium.service";
import { auth } from "@/auth"
import { revalidatePath } from "next/cache";

export async function getAuthedUserId(): Promise<string | null> {
	const session = await auth();
	return session?.user?.id ?? null;
}


export async function createSessionAction(
	title: string | null,
	folderId: string | null,
	targetMinutes: number,
) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	const created = await solariumService.createSession(
		userId,
		title,
		folderId,
		targetMinutes,
	);

	revalidatePath("/solarium");
	return created;
}

export async function heartbeatAction(sessionId: string) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	return await solariumService.heartbeat(userId, sessionId)
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
		breakMinutes)

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
		breakMinutes,)

	revalidatePath("/solarium");
}