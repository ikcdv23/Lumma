import { prisma } from "@/lib/prisma";

export function findActiveByUser(userId: string) {
	return prisma.studySession.findFirst({
		where: { userId, status: "ACTIVE" },
		orderBy: { startedAt: "desc" },
	});
}

export function findActiveByIdForUser(sessionId: string, userId: string) {
	return prisma.studySession.findFirst({
		where: { id: sessionId, userId, status: "ACTIVE" },
		select: { id: true, startedAt: true, targetMinutes: true },
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

export function findStudyMaterialByUser(userId: string) {
	return prisma.studySession.findFirst({
		where: { userId, status: "ACTIVE" },
		orderBy: { startedAt: "desc" },
		include: {
			folder: { include: { notes: { select: { id: true, title: true, content: true } } } },
			notes: { select: { id: true, title: true, content: true } },
		},
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

export function forceMarkAbandoned(sessionId: string, userId: string, endedAt: Date) {
	return prisma.studySession.updateMany({
		where: { id: sessionId, userId },
		data: { status: "ABANDONED", endedAt },
	});
}

export async function sumTodayStudyMinutes(userId: string): Promise<number> {
	const startOfDay = new Date();
	startOfDay.setHours(0, 0, 0, 0);

	const result = await prisma.studySession.aggregate({
		where: {
			userId,
			startedAt: { gte: startOfDay },
			status: { not: "ACTIVE" },
		},
		_sum: { studyMinutes: true },
	});

	return result._sum.studyMinutes ?? 0;
}
