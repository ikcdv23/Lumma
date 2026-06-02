import { prisma } from "@/lib/prisma";
import type { KanbanStatus } from "@/generated/prisma/client";

/**
 * Capa de datos para KanbanCard. Sin auth, sin lógica de negocio:
 * queries Prisma. Las tarjetas viven asociadas a UNA StudySession, así que
 * filtramos por studySessionId. Para verificar ownership pedimos también el
 * userId y lo encadenamos con `studySession: { userId }` para que Prisma haga
 * el JOIN y descarte sesiones de otros users.
 */

export function findAllBySession(sessionId: string, userId: string) {
	return prisma.kanbanCard.findMany({
		where: {
			studySessionId: sessionId,
			studySession: { userId },
		},
		orderBy: { createdAt: "desc" },
	});
}

export function create(data: {
	studySessionId: string;
	title: string;
	status?: KanbanStatus;
}) {
	return prisma.kanbanCard.create({
		data: {
			studySessionId: data.studySessionId,
			title: data.title,
			status: data.status ?? "PENDING",
		},
	});
}

export function updateStatus(
	cardId: string,
	userId: string,
	status: KanbanStatus,
) {
	return prisma.kanbanCard.updateMany({
		where: {
			id: cardId,
			studySession: { userId },
		},
		data: { status },
	});
}

export function updateTitle(cardId: string, userId: string, title: string) {
	return prisma.kanbanCard.updateMany({
		where: {
			id: cardId,
			studySession: { userId },
		},
		data: { title },
	});
}

export function remove(cardId: string, userId: string) {
	return prisma.kanbanCard.deleteMany({
		where: {
			id: cardId,
			studySession: { userId },
		},
	});
}

/**
 * Verifica que la sesión existe y pertenece al user antes de crear cards en
 * ella. Lo usa el service para no añadir cards a sesiones ajenas.
 */
export function sessionBelongsToUser(sessionId: string, userId: string) {
	return prisma.studySession.findFirst({
		where: { id: sessionId, userId },
		select: { id: true },
	});
}
