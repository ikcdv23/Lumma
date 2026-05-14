"use client";

import { EditableNote } from "@/components/notes/editable-note";

export function ActiveNoteEditor({
	selectedNote,
}: {
	selectedNote: { id: string; title: string; content: unknown } | null;
}) {
	if (!selectedNote) {
		return (
			<section className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
				Selecciona una nota del panel de material para empezar
			</section>
		);
	}

	return (
		<section className="flex flex-1 flex-col overflow-y-auto">
			<div className="mx-auto w-full max-w-3xl px-8 py-12">
				<EditableNote note={selectedNote} />
			</div>
		</section>
	);
}
