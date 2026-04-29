"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Inbox, Sparkles, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type FastNotesProps = {
	userName: string;
};

export default function FastNotes({ userName }: FastNotesProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [noteText, setNoteText] = useState("");

	return (
		<div>
			{/* Hero */}
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

				{/* Tarjeta Nota Rapida — origen de la animacion */}
				{!isExpanded && (
					<motion.button
						layoutId="quick-note"
						onClick={() => setIsExpanded(true)}
						className="w-full max-w-2xl flex flex-col gap-3 rounded-2xl border bg-card p-6 text-left transition-shadow hover:shadow-md cursor-text"
					>
						<motion.div
							layoutId="quick-note-header"
							className="flex items-center gap-2"
						>
							<Inbox className="size-5 text-primary" />
							<span className="font-medium">Nota rapida</span>
						</motion.div>
						<motion.p
							layoutId="quick-note-placeholder"
							className="text-muted-foreground"
						>
							{noteText || "Escribe lo que tengas en mente..."}
						</motion.p>
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
							onClick={() => setIsExpanded(false)}
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
							{/* Header de la nota */}
							<div className="flex items-center justify-between gap-4 border-b px-6 py-4">
								<motion.div
									layoutId="quick-note-header"
									className="flex items-center gap-2"
								>
									<Inbox className="size-5 text-primary" />
									<span className="font-medium">Nota rapida</span>
									<span className="text-xs text-muted-foreground ml-2">
										Inbox
									</span>
								</motion.div>
								<div className="flex items-center gap-2">
									<Button variant="outline" size="sm">
										<Save className="size-4" />
										Guardar
									</Button>
									<Button
										variant="ghost"
										size="icon-sm"
										onClick={() => setIsExpanded(false)}
										aria-label="Cerrar"
									>
										<X className="size-4" />
									</Button>
								</div>
							</div>

							{/* Editor */}
							<div className="flex-1 overflow-auto p-8 md:p-12">
								<input
									type="text"
									placeholder="Titulo de la nota"
									className="w-full bg-transparent text-2xl md:text-3xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/50"
									autoFocus
								/>
								<motion.div layoutId="quick-note-placeholder">
									<textarea
										value={noteText}
										onChange={(e) => setNoteText(e.target.value)}
										placeholder="Escribe lo que tengas en mente..."
										rows={20}
										className="w-full mt-4 bg-transparent text-base leading-relaxed outline-none placeholder:text-muted-foreground/50 resize-none"
									/>
								</motion.div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
