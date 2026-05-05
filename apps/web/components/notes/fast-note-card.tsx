"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Inbox, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { createNote, updateNote } from "@/server/actions/notes-actions";

type FastNotesProps = {
	userName: string;
	note?: {
		title: string;
		content: string;
	};
};

export default function FastNotes({ note, userName }: FastNotesProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [title, setTitle] = useState(note?.title ?? "");
	const [noteText, setNoteText] = useState(note?.content ?? "");
	const [noteId, setNoteId] = useState<string | null>(null);
	const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
		"idle",
	);
	useEffect(() => {
		// Guard: si no hay nada escrito, no haces nada
		if (!title.trim() && !noteText.trim()) return;

		setSaveStatus("saving");

		const timer = setTimeout(async () => {
			if (noteId === null) {
				const note = await createNote(null, title, noteText);
				if (note) setNoteId(note.id);
			} else {
				await updateNote(noteId, { title, content: noteText });
			}
			setSaveStatus("saved");
		}, 600);

		return () => clearTimeout(timer);
	}, [title, noteText]);

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

	function handleClose() {
		setIsExpanded(false);
		setTitle("");
		setNoteText("");
		setNoteId(null);
		setSaveStatus("idle");
	}

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
							{noteText || "Escribe lo que tengas en mente..."}
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
							transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
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
								<input
									id="title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									type="text"
									placeholder="Titulo de la nota"
									className="w-full bg-transparent text-2xl md:text-3xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/50"
									autoFocus
								/>
								<textarea
									value={noteText}
									onChange={(e) => setNoteText(e.target.value)}
									placeholder="Escribe lo que tengas en mente..."
									rows={20}
									className="w-full mt-4 bg-transparent text-base leading-relaxed outline-none placeholder:text-muted-foreground/50 resize-none"
								/>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
