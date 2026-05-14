"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { NoteActionsMenu } from "@/components/notes/note-actions-menu";
import { EditableNote, type SaveStatus } from "@/components/notes/editable-note";

type Note = {
	id: string;
	title: string;
	content: unknown;
	folderId: string | null;
	createdAt: Date;
};

export function NoteDetailClient({ note }: { note: Note }) {
	const backUrl = note.folderId ? `/folders/${note.folderId}` : "/inbox";
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

	return (
		<div className="flex h-full w-full flex-col bg-background">
			{/* Header sticky con backdrop blur */}
			<header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border/40 bg-background/80 px-4 py-2.5 backdrop-blur-md md:px-6">
				<Button variant="ghost" size="sm" asChild className="-ml-2">
					<Link href={backUrl}>
						<ArrowLeft className="size-4" />
						Volver
					</Link>
				</Button>

				<div className="flex items-center gap-2 md:gap-3">
					<SaveIndicator status={saveStatus} />

					<button
						type="button"
						className="flex items-center gap-1.5 rounded-full border bg-card/50 px-3 py-1 text-xs font-medium transition-all hover:border-primary/40 hover:bg-card hover:shadow-sm"
					>
						<Inbox className="size-3.5 text-primary" />
						{note.folderId ? "Carpeta" : "Inbox"}
					</button>

					<NoteActionsMenu
						noteId={note.id}
						currentFolderId={note.folderId}
						redirectAfterDelete={note.folderId ? `/folders/${note.folderId}` : "/inbox"}
					/>
				</div>
			</header>

			{/* Body con scroll independiente */}
			<div className="flex-1 overflow-auto">
				<div className="mx-auto w-full max-w-4xl px-6 py-10 md:px-10 md:py-16">
					<EditableNote note={note} onSaveStatusChange={setSaveStatus} />
				</div>
			</div>
		</div>
	);
}
