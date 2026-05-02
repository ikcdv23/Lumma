"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFolder(name: string) {
	const session = await auth();
	if (!session?.user?.id) return;

	const folder = await prisma.folder.create({
		data: {
			name: name,
			userId: session.user!.id,
		},
	});

	revalidatePath("/folders");
	return folder;
}
export async function deleteFolder(idFolder: string) {
	const session = await auth();
	if (!session?.user?.id) return;

	await prisma.folder.delete({
		where: {
			id: idFolder,
			userId: session.user!.id,
		},
	});

	revalidatePath("/folders");
}

export async function updateFolder(idFolder: string, name?: string) {
	const session = await auth();
	if (!session?.user?.id) return;

	if (!name || name.trim() === "") return;

	const folder = await prisma.folder.update({
		where: { id: idFolder, userId: session.user!.id },
		data: { name: name },
	});

	revalidatePath("/folders");
	return folder;
}

export async function indexFolders() {
	const session = await auth();
	if (!session?.user?.id) return;

	return await prisma.folder.findMany({
		where: { userId: session.user.id },
		include: {
			_count: {
				select: { notes: true },
			},
		},
	});
}

export async function getFolder(folderId: string) {
	const session = await auth();
	if (!session?.user?.id) return null;

	return await prisma.folder.findUnique({
		where: {
			id: folderId,
			userId: session.user.id, // importante: verifica que sea SU carpeta
		},
		include: {
			notes: true,
		},
	});
}

export async function noteCount(folderId: string) {
	const session = await auth();
	if (!session?.user?.id) return;

	return await prisma.note.count({
		where: {
			userId: session.user.id,
			folderId: folderId,
		},
	});
}
