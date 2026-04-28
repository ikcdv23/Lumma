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
