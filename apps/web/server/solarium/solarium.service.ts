import * as solariumRepository from "./solarium.repository";
import * as folderRepository from "@/server/folder/folder.repository";
import * as noteRepository from "@/server/note/note.repository";

const STALE_HEARTBEAT_MS = 2 * 60 * 1000;

// Tope de tolerancia frente al tiempo real transcurrido. Sin esto, el cliente
// podría inflar studyMinutes y manipular streak / TODAY_MINUTES.
const MINUTES_SLACK = 5;

export async function getActiveSession(userId: string) {
	const active = await solariumRepository.findActiveByUser(userId);
	if (!active) return null;

	const elapsed = Date.now() - active.lastSeenAt.getTime();
	if (elapsed > STALE_HEARTBEAT_MS) {
		await solariumRepository.forceMarkAbandoned(active.id, userId, active.lastSeenAt);
		return null;
	}
	return active;
}

function clampReportedMinutes(reported: number, maxMinutes: number): number {
	if (!Number.isFinite(reported)) return 0;
	return Math.max(0, Math.min(maxMinutes, Math.floor(reported)));
}

async function settleSession(
	userId: string,
	sessionId: string,
	status: "ABANDONED" | "COMPLETED",
	studyMinutes: number,
	breakMinutes: number,
) {
	const session = await solariumRepository.findActiveByIdForUser(sessionId, userId);
	if (!session) return null;

	const realElapsedMin = (Date.now() - session.startedAt.getTime()) / 60_000;
	const maxMinutes = Math.ceil(realElapsedMin) + MINUTES_SLACK;

	return solariumRepository.markStatus(
		sessionId,
		userId,
		status,
		clampReportedMinutes(studyMinutes, maxMinutes),
		clampReportedMinutes(breakMinutes, maxMinutes),
	);
}

export function getRecentSessions(userId: string, limit: number = 10) {
	return solariumRepository.findRecentByUser(userId, limit);
}

export async function getStreak(userId: string) {
	const completed = await solariumRepository.findCompletedByUser(userId);
	if (completed.length === 0) return 0;

	// Clave por día en hora local (no UTC). Con toISOString() una sesión
	// completada a las 23:30 con TZ+2 caía en el día UTC siguiente y rompía
	// el streak cerca de medianoche.
	const dayKey = (d: Date) => {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		return `${y}-${m}-${day}`;
	};
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

export type CreateSessionResult =
	| { ok: true; created: true; session: Awaited<ReturnType<typeof solariumRepository.create>> }
	| { ok: true; created: false; reason: "already-active"; session: NonNullable<Awaited<ReturnType<typeof solariumRepository.findActiveByUser>>> }
	| { ok: false; reason: "invalid-material" };

export async function createSession(
	userId: string,
	input: {
		title: string | null;
		folderIds: string[];
		noteIds: string[];
		targetMinutes: number;
	},
): Promise<CreateSessionResult> {
	// Si ya hay una activa, NO la pisamos silenciosamente con la config nueva.
	// Devolvemos `created: false` para que el cliente sepa que va a `/active`
	// con la sesión vieja y pueda avisar al user.
	const existing = await solariumRepository.findActiveByUser(userId);
	if (existing) {
		return { ok: true, created: false, reason: "already-active", session: existing };
	}

	// Validar ownership cross-feature: el service de solarium puede leer de
	// repos de otros features (regla de arquitectura). Lo que NO puede es
	// llamar a services de otros features.
	if (input.folderIds.length > 0) {
		const ownedFolders = await folderRepository.countOwnedByUser(
			input.folderIds,
			userId,
		);
		if (ownedFolders !== input.folderIds.length) {
			return { ok: false, reason: "invalid-material" };
		}
	}

	if (input.noteIds.length > 0) {
		const ownedNotes = await noteRepository.countOwnedByUser(
			input.noteIds,
			userId,
		);
		if (ownedNotes !== input.noteIds.length) {
			return { ok: false, reason: "invalid-material" };
		}
	}

	const session = await solariumRepository.create({
		userId,
		folderIds: input.folderIds,
		noteIds: input.noteIds,
		title: input.title?.trim() || defaultSessionTitle(),
		targetMinutes: input.targetMinutes,
	});

	return { ok: true, created: true, session };
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
	return settleSession(userId, sessionId, "ABANDONED", studyMinutes, breakMinutes);
}

export function completeSession(
	userId: string,
	sessionId: string,
	studyMinutes: number,
	breakMinutes: number,
) {
	return settleSession(userId, sessionId, "COMPLETED", studyMinutes, breakMinutes);
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