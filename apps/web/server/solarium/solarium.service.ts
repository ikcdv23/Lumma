import { prisma } from "@/lib/prisma";
import * as solariumRepository from "./solarium.repository";

const STALE_HEARTBEAT_MS = 2 * 60 * 1000;

export async function getActiveSession(userId: string) {
	const active = await solariumRepository.findActiveByUser(userId);
	if (!active) return null;

	const elapsed = Date.now() - active.lastSeenAt.getTime();
	if (elapsed > STALE_HEARTBEAT_MS) {
		await solariumRepository.forceMarkAbandoned(active.id, active.lastSeenAt);
		return null;
	}
	return active;
}

export function getRecentSessions(userId: string, limit: number = 10) {
	return solariumRepository.findRecentByUser(userId, limit);
}

export async function getStreak(userId: string) {
	const completed = await solariumRepository.findCompletedByUser(userId);
	if (completed.length === 0) return 0;

	const dayKey = (d: Date) => d.toISOString().slice(0, 10);
	const daysWithSession = new Set(
		completed.map((s) => dayKey(s.startedAt)),
	);

	const today = new Date();
	const yesterday = new Date(today.getTime() - 86_400_000);

	let cursor: Date;
	if (daysWithSession.has(dayKey(today))) {
		cursor = today;
	} else if (daysWithSession.has(dayKey(yesterday))) {
		cursor = yesterday;
	} else {
		return 0;
	}

	let streak = 0;
	while (daysWithSession.has(dayKey(cursor))) {
		streak++;
		cursor = new Date(cursor.getTime() - 86_400_000);
	}

	return streak;
}

export async function createSession(
	userId: string,
	title: string | null,
	folderId: string | null,
	targetMinutes: number,
) {
	const existing = await solariumRepository.findActiveByUser(userId);
	if (existing) return existing;

	// TODO: mover a folderRepository.findByIdAndUser cuando exista la capa de folders
	if (folderId) {
		const folder = await prisma.folder.findUnique({
			where: { id: folderId, userId },
			select: { id: true },
		});
		if (!folder) return null;
	}

	return solariumRepository.create({
		userId,
		folderId,
		title: title?.trim() || defaultSessionTitle(),
		targetMinutes,
	});
}

export function heartbeat(userId: string, sessionId: string) {
	return solariumRepository.updateHeartbeat(sessionId, userId);
}

export function abandonSession(
	userId: string,
	sessionId: string,
	studyMinutes: number,
	breakMinutes: number,
) {
	return solariumRepository.markStatus(
		sessionId,
		userId,
		"ABANDONED",
		studyMinutes,
		breakMinutes,
	);
}

export function completeSession(
	userId: string,
	sessionId: string,
	studyMinutes: number,
	breakMinutes: number,
) {
	return solariumRepository.markStatus(
		sessionId,
		userId,
		"COMPLETED",
		studyMinutes,
		breakMinutes,
	);
}

function defaultSessionTitle(): string {
	return `Sesión del ${new Date().toLocaleDateString("es-ES", {
		day: "numeric",
		month: "long",
		year: "numeric",
	})}`;
}
