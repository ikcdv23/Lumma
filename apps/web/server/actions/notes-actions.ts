"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { Prisma } from "@/generated/prisma/client";

export async function createNote(
	folderId: string | null,
	title: string,
	content: string = "",
) {
	const session = await auth();
	if (!session?.user?.id) return null;

	const note = await prisma.note.create({
		data: {
			title,
			content,
			folderId,
			userId: session.user.id,
		},
	});

	revalidatePath(folderId ? `/folders/${folderId}` : "/home");
	return note;
}

export async function getNote(noteId: string) {
	const session = await auth();
	if (!session?.user?.id) return null;

	return await prisma.note.findUnique({
		where: {
			id: noteId,
			userId: session.user.id,
		},
	});
}

export async function updateNote(
	noteId: string,
	data: { title?: string; content?: unknown },
) {
	const session = await auth();
	if (!session?.user?.id) return null;

	const note = await prisma.note.update({
		where: {
			id: noteId,
			userId: session.user.id,
		},
		data: data as Prisma.NoteUpdateInput,
	});

	revalidatePath(note.folderId ? `/folders/${note.folderId}` : "/home");
	return note;
}

export async function moveNoteToFolder(
	noteId: string,
	targetFolderId: string | null,
) {
	const session = await auth();
	if (!session?.user?.id) return null;

	// Si va a una carpeta, verificar que sea del usuario
	if (targetFolderId) {
		const folder = await prisma.folder.findUnique({
			where: { id: targetFolderId, userId: session.user.id },
			select: { id: true },
		});
		if (!folder) return null;
	}

	const previous = await prisma.note.findUnique({
		where: { id: noteId, userId: session.user.id },
		select: { folderId: true },
	});
	if (!previous) return null;

	const note = await prisma.note.update({
		where: { id: noteId, userId: session.user.id },
		data: { folderId: targetFolderId },
	});

	// Revalidar origen y destino
	revalidatePath(previous.folderId ? `/folders/${previous.folderId}` : "/inbox");
	revalidatePath(targetFolderId ? `/folders/${targetFolderId}` : "/inbox");
	revalidatePath("/home");
	return note;
}

export async function deleteNote(noteId: string) {
	const session = await auth();
	if (!session?.user?.id) return;

	const note = await prisma.note.delete({
		where: {
			id: noteId,
			userId: session.user.id,
		},
	});

	revalidatePath(note.folderId ? `/folders/${note.folderId}` : "/home");
}

export async function getRecentNotes(limit: number = 10) {
	const session = await auth();
	if (!session?.user?.id) return [];

	return await prisma.note.findMany({
		where: { userId: session.user.id },
		orderBy: { updatedAt: "desc" },
		take: limit,
		include: {
			folder: {
				select: { name: true },
			},
		},
	});
}

export async function searchNotes(query: string) {
    const session = await auth();
    if (!session?.user?.id) return [];
    if (!query.trim()) return [];

    return await prisma.note.findMany({
        where: {
            userId: session.user.id,
            title: { contains: query, mode: "insensitive" },
        },
        orderBy: { updatedAt: "desc" },
        take: 20,
    });
}

export async function getInboxCount() {
	const session = await auth();
	if (!session?.user?.id) return 0;

	return await prisma.note.count({
		where: {
			userId: session.user.id,
			folderId: null,
		},
	});
}

export async function getInboxNotes() {
	const session = await auth();
	if (!session?.user?.id) return [];

	return await prisma.note.findMany({
		where: {
			userId: session.user.id,
			folderId: null,
		},
		orderBy: { updatedAt: "desc" },
	});
}

export async function createNoteAndRedirect(folderId: string | null) {
	const session = await auth();
	if (!session?.user?.id) return;

	const note = await prisma.note.create({
		data: {
			title: "",
			content: {},
			folderId,
			userId: session.user.id,
		},
	});

	revalidatePath(folderId ? `/folders/${folderId}` : "/home");
	redirect(`/notes/${note.id}`);
}
