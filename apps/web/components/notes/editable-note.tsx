"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Block, PartialBlock } from "@blocknote/core";
import { toast } from "sonner";
import { updateNoteAction } from "@/server/note/note.actions";
import { TemplatePicker } from "./template-picker";

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

// Una nota se considera "vacía" si la BD no devolvió bloques y el título
// está vacío. Solo entonces ofrecemos el selector de plantillas.
function isNoteEmpty(note: Props["note"]): boolean {
	if (note.title && note.title.trim().length > 0) return false;
	const initial = toInitialBlocks(note.content);
	return initial === undefined;
}

export function EditableNote({
	note,
	onSaveStatusChange,
	onDirtyChange,
}: Props) {
	const [title, setTitle] = useState(note.title);
	const [blocks, setBlocks] = useState<Block[] | null>(null);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
	const [showTemplatePicker, setShowTemplatePicker] = useState(() =>
		isNoteEmpty(note),
	);
	// Si el user aplica una plantilla, pintamos los bloques optimistamente sin
	// esperar a que el server confirme. El `key` cambia → BlockNote se remonta
	// con el initialContent nuevo. La autosave que dispara BlockNote tras el
	// remount se solapa con la save de applyTemplateAction; aceptamos el doble
	// save (cost negligible) a cambio de simplicidad.
	const [templateBlocks, setTemplateBlocks] = useState<PartialBlock[] | null>(
		null,
	);

	// pendingRef = último payload aún no confirmado por el server. Permite que
	// el cleanup haga flush al desmontar (cambio de nota, navegación) en vez
	// de perder los últimos cambios cuando el timer del debounce no llegó a
	// ejecutarse.
	const pendingRef = useRef<{ title: string; content?: Block[] } | null>(null);

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
		if (blocks === null && title === note.title) {
			pendingRef.current = null;
			return;
		}

		pendingRef.current = blocks ? { title, content: blocks } : { title };

		setSaveStatus("saving");
		const timer = setTimeout(async () => {
			const payload = pendingRef.current;
			if (!payload) return;
			try {
				await updateNoteAction(note.id, payload);
				pendingRef.current = null;
				setSaveStatus("saved");
			} catch (err) {
				console.error("Auto-save failed", err);
				toast.error("No se pudo guardar la nota", {
					description: "Comprueba tu conexión. Tus cambios siguen en pantalla.",
				});
				setSaveStatus("idle");
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [title, blocks, note.id, note.title]);

	// Flush al desmontar / cambiar de nota: si el debounce no llegó a disparar,
	// envía el último payload (fire-and-forget). Sin esto, navegar rápido
	// perdía cambios silenciosamente.
	useEffect(() => {
		const noteId = note.id;
		return () => {
			const payload = pendingRef.current;
			if (!payload) return;
			updateNoteAction(noteId, payload).catch((err) => {
				console.error("Auto-save flush failed", err);
			});
			pendingRef.current = null;
		};
	}, [note.id]);

	// Auto-fade del "saved"
	useEffect(() => {
		if (saveStatus !== "saved") return;
		const timer = setTimeout(() => setSaveStatus("idle"), 2000);
		return () => clearTimeout(timer);
	}, [saveStatus]);

	// Si el user empieza a escribir título o contenido, esconde el selector
	// (no intrusivo). Una vez aplicada o descartada una plantilla, no vuelve.
	useEffect(() => {
		if (!showTemplatePicker) return;
		if (title.trim().length > 0 || blocks !== null) {
			setShowTemplatePicker(false);
		}
	}, [title, blocks, showTemplatePicker]);

	return (
		<>
			<input
				type="text"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Sin título"
				className="w-full bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/30 md:text-5xl"
			/>

			{showTemplatePicker && (
				<TemplatePicker
					noteId={note.id}
					onApplied={(blocks) => {
						setTemplateBlocks(blocks);
						setShowTemplatePicker(false);
					}}
					onDismiss={() => setShowTemplatePicker(false)}
				/>
			)}

			<div className="mt-10 -ml-12 md:-ml-14">
				<BlockNoteEditor
					key={templateBlocks ? "template" : "initial"}
					initial={templateBlocks ?? toInitialBlocks(note.content)}
					onChange={setBlocks}
				/>
			</div>
		</>
	);
}
