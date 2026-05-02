import { notFound } from "next/navigation";
import { getNote } from "@/server/actions/notes-actions";
import { NoteDetailClient } from "@/components/notes/note-detail-client";

type Props = {
	params: Promise<{ noteId: string }>;
};

export default async function NotePage({ params }: Props) {
	const { noteId } = await params;
	const note = await getNote(noteId);

	if (!note) notFound();

	return <NoteDetailClient note={note} />;
}
