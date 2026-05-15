import { notFound } from "next/navigation";
import { requireAuthedUserId } from "@/lib/auth-helper";
import * as noteService from "@/server/note/note.service";
import { NoteDetailClient } from "@/components/notes/note-detail-client";

type Props = {
	params: Promise<{ noteId: string }>;
};

export default async function NotePage({ params }: Props) {
	const userId = await requireAuthedUserId();
	const { noteId } = await params;
	const note = await noteService.getNote(userId, noteId);

	if (!note) notFound();

	return <NoteDetailClient note={note} />;
}
