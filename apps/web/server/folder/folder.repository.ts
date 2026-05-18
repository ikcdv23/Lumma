import { prisma } from "@/lib/prisma";

/**
 * Capa de acceso a datos para Folder. Sin auth, sin lógica de negocio:
 * queries Prisma filtradas siempre por userId.
 */

export function findByIdForUser(folderId: string, userId: string) {
	return prisma.folder.findUnique({
		where: { id: folderId, userId },
		include: {
			notes: {
				orderBy: { updatedAt: "desc" },
			},
		},
	});
}

export function findManyByUser(userId: string) {
	return prisma.folder.findMany({
		where: { userId },
		include: {
			_count: { select: { notes: true } },
		},
	});
}

export function findManyByUserWithNotes(userId: string) {
	return prisma.folder.findMany({
		where: { userId },
		select: {
			id: true,
			name: true,
			_count: { select: { notes: true } },
			notes: {
				select: { id: true, title: true },
				orderBy: { updatedAt: "desc" },
			},
		},
		orderBy: { name: "asc" },
	});
}

export function existsForUser(folderId: string, userId: string) {
	return prisma.folder.findUnique({
		where: { id: folderId, userId },
		select: { id: true },
	});
}

export function countOwnedByUser(folderIds: string[], userId: string) {
	if (folderIds.length === 0) return Promise.resolve(0);
	return prisma.folder.count({
		where: { id: { in: folderIds }, userId },
	});
}

export function create(data: { userId: string; name: string }) {
	return prisma.folder.create({
		data: {
			name: data.name,
			userId: data.userId,
		},
	});
}

export function createForSession(data: { userId: string; sessionId: string }) {
	return prisma.folder.create({
		data: {
			userId: data.userId,
			name: "",
			studySessions: { connect: { id: data.sessionId } },
		},
		select: { id: true },
	});
}

export function update(folderId: string, userId: string, name: string) {
	return prisma.folder.update({
		where: { id: folderId, userId },
		data: { name },
	});
}

export function remove(folderId: string, userId: string) {
	return prisma.folder.delete({
		where: { id: folderId, userId },
	});
}

export function countNotes(folderId: string, userId: string) {
	return prisma.note.count({
		where: { userId, folderId },
	});
}

export function countByUser(userId: string) {
	return prisma.folder.count({ where: { userId } });
}

export function detachFromSession(
	folderId: string,
	userId: string,
	sessionId: string,
) {
	return prisma.folder.update({
		where: {
			id: folderId,
			userId

		}, data: {
			studySessions: {
				disconnect: { id: sessionId }
			}
		}
	});
}
