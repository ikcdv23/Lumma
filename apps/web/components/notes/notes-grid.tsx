"use client";

import { useState } from "react";
import { NoteCard } from "./note-card";
import { NoteModal } from "./note-modal";
import { Button } from "@/components/ui/button";
import { FilePlus, FileText } from "lucide-react";

type Note = {
	id: string;
	title: string;
	updatedAt: Date;
};

type NotesGridProps = {
	folderId: string;
	folderName: string;
	notes: Note[];
};

export function NotesGrid({ folderId, folderName, notes }: NotesGridProps) {
	const [modalOpen, setModalOpen] = useState(false);
	const [noteToEdit, setNoteToEdit] = useState<{
		id: string;
		title: string;
	} | null>(null);

	function openCreateModal() {
		setNoteToEdit(null);
		setModalOpen(true);
	}

	function openEditModal(note: { id: string; title: string }) {
		setNoteToEdit(note);
		setModalOpen(true);
	}

	const isEmpty = notes.length === 0;

	return (
		<>
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
					<Button onClick={openCreateModal}>
						<FilePlus className="size-4" />
						Nueva nota
					</Button>
				)}
			</div>

			{isEmpty ? (
				<div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 px-6 text-center">
					<div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
						<FileText className="size-8" />
					</div>
					<div className="flex flex-col gap-1">
						<h3 className="text-lg font-semibold">
							Esta carpeta esta vacia
						</h3>
						<p className="text-sm text-muted-foreground max-w-xs">
							Crea tu primera nota para empezar a escribir
						</p>
					</div>
					<Button onClick={openCreateModal} variant="outline">
						<FilePlus className="size-4" />
						Crear mi primera nota
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{notes.map((note) => (
						<NoteCard
							key={note.id}
							idNote={note.id}
							folderId={folderId}
							title={note.title}
							updatedAt={note.updatedAt}
							onEdit={() => openEditModal({ id: note.id, title: note.title })}
						/>
					))}
				</div>
			)}

			<NoteModal
				folderId={folderId}
				open={modalOpen}
				onOpenChange={setModalOpen}
				note={noteToEdit ?? undefined}
			/>
		</>
	);
}
