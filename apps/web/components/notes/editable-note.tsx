"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Block, PartialBlock } from "@blocknote/core";
import { updateNoteAction } from "@/server/note/note.actions";

// BlockNote toca `window` durante el render → import dinámico sin SSR
const BlockNoteEditor = dynamic(
	() => import("@/components/notes/blocknote").then((m) => m.NoteEditor),
	{
		ssr: false,
		loading: () => (
			<div className="my-4 h-32 animate-pulse rounded-md bg-muted/30" />
		),
	},
);

export type SaveStatus = "idle" | "saving" | "saved";

type Props = {
	note: {
		id: string;
		title: string;
		content: unknown;
	};
	onSaveStatusChange?: (status: SaveStatus) => void;
	onDirtyChange?: (dirty: boolean) => void;
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

export function EditableNote({
	note,
	onSaveStatusChange,
	onDirtyChange,
}: Props) {
	const [title, setTitle] = useState(note.title);
	const [blocks, setBlocks] = useState<Block[] | null>(null);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

	// Notificar al padre cualquier cambio de status
	useEffect(() => {
		onSaveStatusChange?.(saveStatus);
	}, [saveStatus, onSaveStatusChange]);

	// Dirty = el usuario aportó algo (título o contenido). Se usa desde el
	// modal de quick note para decidir si la draft creada al abrir debe
	// borrarse al cerrar sin escribir.
	useEffect(() => {
		const dirty = title.trim().length > 0 || blocks !== null;
		onDirtyChange?.(dirty);
	}, [title, blocks, onDirtyChange]);

	// Auto-save con debounce
	useEffect(() => {
		if (blocks === null && title === note.title) return;

		setSaveStatus("saving");
		const timer = setTimeout(async () => {
			await updateNoteAction(
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
		<>
			<input
				type="text"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Sin título"
				className="w-full bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/30 md:text-5xl"
			/>

			<div className="mt-10 -ml-12 md:-ml-14">
				<BlockNoteEditor
					initial={toInitialBlocks(note.content)}
					onChange={setBlocks}
				/>
			</div>
		</>
	);
}
