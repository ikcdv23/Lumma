import * as solariumRepository from "./solarium.repository";
import * as folderRepository from "@/server/folder/folder.repository";
import * as noteRepository from "@/server/note/note.repository";

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

export async function getMaterialByUser(userId: string) {
	return await solariumRepository.findStudyMaterialByUser(userId);
}

export function getTodayStudyMinutes(userId: string) {
	return solariumRepository.sumTodayStudyMinutes(userId);
}

export async function createSession(
	userId: string,
	input: {
		title: string | null;
		folderIds: string[];
		noteIds: string[];
		targetMinutes: number;
	},
) {
	const existing = await solariumRepository.findActiveByUser(userId);
	if (existing) return existing;

	// Validar ownership cross-feature: el service de solarium puede leer de
	// repos de otros features (regla de arquitectura). Lo que NO puede es
	// llamar a services de otros features.
	if (input.folderIds.length > 0) {
		const ownedFolders = await folderRepository.countOwnedByUser(
			input.folderIds,
			userId,
		);
		if (ownedFolders !== input.folderIds.length) return null;
	}

	if (input.noteIds.length > 0) {
		const ownedNotes = await noteRepository.countOwnedByUser(
			input.noteIds,
			userId,
		);
		if (ownedNotes !== input.noteIds.length) return null;
	}

	return solariumRepository.create({
		userId,
		folderIds: input.folderIds,
		noteIds: input.noteIds,
		title: input.title?.trim() || defaultSessionTitle(),
		targetMinutes: input.targetMinutes,
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

export async function detachFolderFromActiveSession(userId: string, folderId: string) {
	const active = await getActiveSession(userId);
	if (!active) return null;

	return folderRepository.detachFromSession(folderId, userId, active.id);
}

export async function createNoteInActiveSession(userId: string) {
	const active = await getActiveSession(userId);
	if (!active) return null;

	return noteRepository.createForSession({ userId, sessionId: active.id });
}

export async function createFolderInActiveSession(userId: string) {
	const active = await getActiveSession(userId);
	if (!active) return null;

	return folderRepository.createForSession({ userId, sessionId: active.id });
}