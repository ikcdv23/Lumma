"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { NoteCard } from "./note-card";
import { NewNoteButton } from "./new-note-button";
import { createNoteAndRedirectAction } from "@/server/note/note.actions";

type Note = {
	id: string;
	title: string;
	content: unknown;
	updatedAt: Date;
};

type NotesGridProps = {
	folderId: string;
	folderName: string;
	notes: Note[];
};

export function NotesGrid({ folderId, folderName, notes }: NotesGridProps) {
	// Estado para el futuro modal de renombrar (aún sin implementar)
	const [, setNoteToEdit] = useState<{
		id: string;
		title: string;
	} | null>(null);

	function openEditModal(note: { id: string; title: string }) {
		setNoteToEdit(note);
		// TODO: abrir modal cuando exista
	}

	const isEmpty = notes.length === 0;
	const createNoteForFolder = createNoteAndRedirectAction.bind(null, folderId);

	return (
		<>
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h1 className="text-3xl font-bold tracking-tight">{folderName}</h1>
					<p className="text-sm text-muted-foreground">
						{isEmpty
							? "Empieza creando tu primera nota"
							: `${notes.length} ${notes.length === 1 ? "nota" : "notas"}`}
					</p>
				</div>

				{!isEmpty && (
					<form action={createNoteForFolder}>
						<NewNoteButton />
					</form>
				)}
			</div>

			{/* Empty state o grid de notas */}
			{isEmpty ? (
				<div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 px-6 text-center">
					<div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
						<FileText className="size-8" />
					</div>
					<div className="flex flex-col gap-1">
						<h3 className="text-lg font-semibold">Esta carpeta esta vacia</h3>
						<p className="text-sm text-muted-foreground max-w-xs">
							Crea tu primera nota para empezar a escribir
						</p>
					</div>
					<form action={createNoteForFolder}>
						<NewNoteButton variant="outline" />
					</form>
				</div>
			) : (
				<div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
					{notes.map((note) => (
						<div key={note.id} className="mb-4 break-inside-avoid">
							<NoteCard
								idNote={note.id}
								folderId={folderId}
								title={note.title}
								content={note.content}
								updatedAt={note.updatedAt}
								onEdit={() =>
									openEditModal({ id: note.id, title: note.title })
								}
							/>
						</div>
					))}
				</div>
			)}
		</>
	);
}
