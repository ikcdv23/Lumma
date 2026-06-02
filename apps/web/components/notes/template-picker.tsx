"use client";

import { useState } from "react";
import type { PartialBlock } from "@blocknote/core";
import { BookOpen, GraduationCap, Lightbulb, X } from "lucide-react";
import { toast } from "sonner";
import {
	NOTE_TEMPLATES,
	findTemplateById,
	type NoteTemplate,
} from "@/lib/note-templates";
import { applyTemplateAction } from "@/server/note/note.actions";

const ICONS: Record<NoteTemplate["icon"], typeof BookOpen> = {
	graduation: GraduationCap,
	book: BookOpen,
	lightbulb: Lightbulb,
};

type Props = {
	noteId: string;
	onApplied: (blocks: PartialBlock[]) => void;
	onDismiss: () => void;
};

/**
 * Selector de plantilla que aparece sobre notas vacías. Aplica las plantillas
 * de forma optimista (el cliente conoce los bloques porque viven en lib/) y
 * en paralelo persiste server-side. Si el save falla, avisamos por toast pero
 * la UI ya mostró el contenido.
 */
export function TemplatePicker({ noteId, onApplied, onDismiss }: Props) {
	const [pendingId, setPendingId] = useState<string | null>(null);

	function handlePick(templateId: string) {
		const tpl = findTemplateById(templateId);
		if (!tpl) return;

		setPendingId(templateId);
		onApplied(tpl.blocks);

		applyTemplateAction(noteId, templateId)
			.then((result) => {
				if (!result.ok) {
					toast.error("No se pudo guardar la plantilla", {
						description: "El contenido está cargado pero aún no se guardó.",
					});
				}
			})
			.catch((err) => {
				console.error("applyTemplateAction failed", err);
				toast.error("No se pudo guardar la plantilla");
			})
			.finally(() => setPendingId(null));
	}

	return (
		<div className="relative mt-8 rounded-xl border bg-card/50 p-5">
			<button
				type="button"
				onClick={onDismiss}
				className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				aria-label="Cerrar selector de plantillas"
			>
				<X className="size-4" />
			</button>

			<div className="mb-4 flex flex-col gap-1">
				<h3 className="text-sm font-semibold">¿Empezar desde una plantilla?</h3>
				<p className="text-xs text-muted-foreground">
					Atajos para estructurar la nota. Puedes editar todo después.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
				{NOTE_TEMPLATES.map((tpl) => {
					const Icon = ICONS[tpl.icon];
					const isPending = pendingId === tpl.id;
					return (
						<button
							key={tpl.id}
							type="button"
							onClick={() => handlePick(tpl.id)}
							disabled={pendingId !== null}
							className="group flex flex-col gap-2 rounded-lg border bg-background p-3 text-left transition-all hover:border-primary/40 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
						>
							<div className="flex items-center gap-2">
								<Icon className="size-4 text-primary" />
								<span className="text-sm font-medium">{tpl.name}</span>
							</div>
							<span className="text-xs text-muted-foreground line-clamp-2">
								{isPending ? "Aplicando..." : tpl.description}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
