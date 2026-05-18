"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Inbox, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveIndicator } from "@/components/ui/save-indicator";
import {
	createNoteAction,
	deleteNoteAction,
} from "@/server/note/note.actions";
import { EditableNote, type SaveStatus } from "./editable-note";

type FastNotesProps = {
	userName: string;
	note?: {
		title: string;
		content: string;
	};
};

export default function FastNotes({ note, userName }: FastNotesProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [draftId, setDraftId] = useState<string | null>(null);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
	const isDirtyRef = useRef(false);

	// Al abrir el modal creamos una nota draft vacía en Inbox. EditableNote
	// la edita por id real. Si el usuario cierra sin escribir, handleClose
	// la borra. Si el usuario cierra antes de que createNoteAction resuelva,
	// el cleanup del effect la borra cuando vuelve.
	useEffect(() => {
		if (!isExpanded || draftId !== null) return;
		let cancelled = false;
		(async () => {
			const created = await createNoteAction(null, "", "");
			if (!created) return;
			if (cancelled) {
				await deleteNoteAction(created.id);
				return;
			}
			setDraftId(created.id);
		})();
		return () => {
			cancelled = true;
		};
	}, [isExpanded, draftId]);

	// Auto-fade del "Guardado" a "idle" pasados 2s
	useEffect(() => {
		if (saveStatus !== "saved") return;
		const timer = setTimeout(() => setSaveStatus("idle"), 2000);
		return () => clearTimeout(timer);
	}, [saveStatus]);

	// Escape key para cerrar el modal
	useEffect(() => {
		if (!isExpanded) return;

		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") handleClose();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isExpanded]);

	async function handleClose() {
		const id = draftId;
		const dirty = isDirtyRef.current;
		setIsExpanded(false);
		setDraftId(null);
		setSaveStatus("idle");
		isDirtyRef.current = false;
		if (id && !dirty) {
			await deleteNoteAction(id);
		}
	}

	const previewText = note?.content ?? "";

	return (
		<div>
			{/* Hero (estado colapsado) */}
			<motion.div
				className="flex flex-col items-center gap-6 pt-8"
				animate={{ opacity: isExpanded ? 0 : 1 }}
				transition={{ duration: 0.2 }}
			>
				<div className="flex flex-col items-center gap-2 text-center">
					<Sparkles className="size-8 text-primary" />
					<h1 className="text-3xl font-bold tracking-tight">
						Hola, {userName}
					</h1>
					<p className="text-sm text-muted-foreground">Que tienes en mente?</p>
				</div>

				{/* Tarjeta nota rapida (origen de la animacion) */}
				{!isExpanded && (
					<motion.button
						layoutId="quick-note"
						onClick={() => setIsExpanded(true)}
						className="w-full max-w-2xl flex flex-col gap-3 rounded-2xl border bg-card p-6 text-left transition-shadow hover:shadow-md cursor-text"
					>
						<div className="flex items-center gap-2">
							<Inbox className="size-5 text-primary" />
							<span className="font-medium">Nota rapida</span>
						</div>
						<p className="text-muted-foreground">
							{previewText || "Escribe lo que tengas en mente..."}
						</p>
					</motion.button>
				)}

				<p className="text-xs text-muted-foreground">
					Las notas rapidas van a tu Inbox
				</p>
			</motion.div>

			{/* Vista expandida (fullscreen editor) */}
			<AnimatePresence>
				{isExpanded && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
							onClick={handleClose}
						/>

						{/* Card expandida */}
						<motion.div
							layoutId="quick-note"
							className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex flex-col rounded-2xl border bg-card shadow-2xl overflow-hidden"
							transition={{
								type: "spring",
								damping: 28,
								stiffness: 220,
							}}
						>
							{/* Header del modal */}
							<div className="flex items-center justify-between gap-4 border-b px-6 py-4">
								<div className="flex items-center gap-3">
									<div className="flex items-center gap-2">
										<Inbox className="size-5 text-primary" />
										<span className="font-medium">Nota rapida</span>
										<div className="flex items-center rounded-full border bg-card px-2 py-1 text-xs text-muted-foreground">
											Inbox
										</div>
									</div>

									{/* Indicador de auto-save */}
									<SaveIndicator status={saveStatus} />
								</div>

								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="icon-sm"
										onClick={handleClose}
										aria-label="Cerrar"
									>
										<X className="size-4" />
									</Button>
								</div>
							</div>

							{/* Editor */}
							<div className="flex-1 overflow-auto p-8 md:p-12">
								{draftId ? (
									<EditableNote
										note={{ id: draftId, title: "", content: undefined }}
										onSaveStatusChange={setSaveStatus}
										onDirtyChange={(dirty) => {
											isDirtyRef.current = dirty;
										}}
									/>
								) : (
									<div className="my-4 h-32 animate-pulse rounded-md bg-muted/30" />
								)}
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
