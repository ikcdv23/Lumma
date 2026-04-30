"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createNote(folderId: string, title: string) {
	const session = await auth();
	if (!session?.user?.id) return null;

	const note = await prisma.note.create({
		data: {
			title,
			content: {},
			folderId,
			userId: session.user.id,
		},
	});

	revalidatePath(`/folders/${folderId}`);
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
	data: { title?: string; content?: object }
) {
	const session = await auth();
	if (!session?.user?.id) return null;

	const note = await prisma.note.update({
		where: {
			id: noteId,
			userId: session.user.id,
		},
		data,
	});

	revalidatePath(`/folders/${note.folderId}`);
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

	revalidatePath(`/folders/${note.folderId}`);
}

export async function getRecentNotes(limit: number = 4) {
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

export async function getInboxCount() {
	const session = await auth();
	if (!session?.user?.id) return 0;

	return await prisma.note.count({
		where: {
			userId: session.user.id,
			isQuickNote: true,
		},
	});
}

export async function getInboxNotes() {
	const session = await auth();
	if (!session?.user?.id) return [];

	return await prisma.note.findMany({
		where: {
			userId: session.user.id,
			isQuickNote: true,
		},
		orderBy: { updatedAt: "desc" },
	});
}

export async function createQuickNote() {
	const session = await auth();
	if (!session?.user?.id) return null;

	const count = await prisma.note.count({ 
		where: {
			userId: session.user.id,
			title: { startsWith: "Nota rápida " },
		},
	});

	const note = await prisma.note.create({
		data: {
			title: `Nota rápida ${count + 1}`,
			content: {},
			folderId: null,
			userId: session.user.id,
			isQuickNote: true
		},
	});

	revalidatePath("/home");
	return note;
}
