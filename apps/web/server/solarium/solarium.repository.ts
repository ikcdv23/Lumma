import { prisma } from "@/lib/prisma";

export function findActiveByUser(userId: string) {
	return prisma.studySession.findFirst({
		where: { userId, status: "ACTIVE" },
		orderBy: { startedAt: "desc" },
	});
}

export function findRecentByUser(userId: string, limit: number = 10) {
	return prisma.studySession.findMany({
		where: { userId, status: { not: "ACTIVE" } },
		orderBy: { startedAt: "desc" },
		take: limit,
	});
}

export function findCompletedByUser(userId: string) {
	return prisma.studySession.findMany({
		where: { userId, status: "COMPLETED" },
		select: { startedAt: true },
		orderBy: { startedAt: "desc" },
	});
}

export function create(data: {
	userId: string;
	folderIds: string[];
	noteIds: string[];
	title: string;
	targetMinutes: number;
}) {
	return prisma.studySession.create({
		data: {
			userId: data.userId,
			title: data.title,
			targetMinutes: data.targetMinutes,
			folder: {
				connect: data.folderIds.map((id) => ({ id })),
			},
			notes: {
				connect: data.noteIds.map((id) => ({ id })),
			},
		},
	});
}

export function updateHeartbeat(sessionId: string, userId: string) {
	return prisma.studySession.updateMany({
		where: { id: sessionId, userId, status: "ACTIVE" },
		data: { lastSeenAt: new Date() },
	});
}

export function markStatus(
	sessionId: string,
	userId: string,
	status: "ABANDONED" | "COMPLETED",
	studyMinutes: number,
	breakMinutes: number,
) {
	return prisma.studySession.updateMany({
		where: { id: sessionId, userId, status: "ACTIVE" },
		data: { status, endedAt: new Date(), studyMinutes, breakMinutes },
	});
}

export function forceMarkAbandoned(sessionId: string, endedAt: Date) {
	return prisma.studySession.update({
		where: { id: sessionId },
		data: { status: "ABANDONED", endedAt },
	});
}
