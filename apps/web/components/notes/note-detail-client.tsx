"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Inbox } from "lucide-react";
import type { Block, PartialBlock } from "@blocknote/core";
import { Button } from "@/components/ui/button";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { NoteActionsMenu } from "@/components/notes/note-actions-menu";
import { updateNote } from "@/server/actions/notes-actions";

// BlockNote toca `window` durante el render → import dinámico sin SSR
const NoteEditor = dynamic(
	() => import("@/components/notes/blocknote").then((m) => m.NoteEditor),
	{
		ssr: false,
		loading: () => <div className="my-4 h-32 animate-pulse rounded-md bg-muted/30" />,
	},
);

type Note = {
	id: string;
	title: string;
	content: unknown;
	folderId: string | null;
	createdAt: Date;
};

// Convierte el content de la BD al formato que BlockNote acepta
function toInitialBlocks(content: unknown): PartialBlock[] | undefined {
	// Caso 1: ya es array de bloques (creadas/editadas en el editor rico)
	if (Array.isArray(content)) {
		return content as PartialBlock[];
	}
	// Caso 2: es string (notas viejas creadas desde la quick note)
	if (typeof content === "string" && content.length > 0) {
		return [{ type: "paragraph", content: content }];
	}
	// Caso 3: {} o null o cualquier otra cosa → arrancar vacío
	return undefined;
}

export function NoteDetailClient({ note }: { note: Note }) {
	const backUrl = note.folderId ? `/folders/${note.folderId}` : "/inbox";
	const [title, setTitle] = useState(note.title);
	const [blocks, setBlocks] = useState<Block[] | null>(null);
	const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
		"idle",
	);

	// Auto-save con debounce
	useEffect(() => {
		if (blocks === null && title === note.title) return;

		setSaveStatus("saving");
		const timer = setTimeout(async () => {
			await updateNote(
				note.id,
				blocks ? { title, content: blocks } : { title },
			);
			setSaveStatus("saved");
		}, 500);

		return () => clearTimeout(timer);
	}, [title, blocks, note.id, note.title]);

	// Auto-fade del "saved"
	useEffect(() => {
		if (saveStatus !== "saved") return;
		const timer = setTimeout(() => setSaveStatus("idle"), 2000);
		return () => clearTimeout(timer);
	}, [saveStatus]);

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
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Sin título"
						className="w-full bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/30 md:text-5xl"
					/>
					

					<div className="mt-10 -ml-12 md:-ml-14">
						<NoteEditor
							initial={toInitialBlocks(note.content)}
							onChange={setBlocks}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
