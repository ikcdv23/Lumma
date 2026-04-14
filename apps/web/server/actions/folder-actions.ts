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

	revalidatePath("/notes");
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
}

export async function updateFolders(idFolder: string, name?: string) {
	const session = await auth();
	if (!session?.user?.id) return;

	const folder = await prisma.folder.update({
		where: { id: idFolder, userId: session.user!.id },
		data: { name: name },
	});

	return folder;
}

export async function indexFolders() {
	const session = await auth();
	if (!session?.user?.id) return;

	return await prisma.folder.findMany({
		where: { userId: session?.user?.id },
		include: {
			_count: {
				select: { notes: true },
			},
		},
	});
}
