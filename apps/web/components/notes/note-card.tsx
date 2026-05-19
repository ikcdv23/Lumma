"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { formatRelative } from "@/lib/format-date";
import { extractPreview } from "@/lib/note-content";
import { deleteNoteAction } from "@/server/note/note.actions";
import { useConfirm } from "../confirm/confirm-provider";

type NoteCardProps = {
	idNote: string;
	folderId: string;
	title: string;
	content: unknown;
	updatedAt: Date;
	onEdit: () => void;
};

export function NoteCard({
	idNote,
	folderId,
	title,
	content,
	updatedAt,
	onEdit,
}: NoteCardProps) {
	const preview = extractPreview(content, 180);
	const confirm = useConfirm();

	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<Link
					href={`/notes/${idNote}`}
					className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300 ease-out hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer"
				>
					{/* Línea gradient decorativa que aparece on hover */}
					<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

					{/* Icon bubble */}
					<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-105">
						<FileText className="size-4.5" />
					</div>

					{/* Cuerpo: título + preview + fecha */}
					<div className="flex flex-col gap-2 min-w-0 flex-1">
						{title ? (
							<h3
								className="font-semibold text-base leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-primary"
								title={title}
							>
								{title}
							</h3>
						) : preview ? (
							<h3 className="font-semibold text-base leading-snug line-clamp-2 text-foreground/70 transition-colors duration-200 group-hover:text-primary">
								{preview}
							</h3>
						) : (
							<h3 className="font-normal italic text-base leading-snug text-muted-foreground/60">
								Vacía
							</h3>
						)}

						{title && preview && (
							<p className="text-sm text-muted-foreground line-clamp-6 leading-relaxed">
								{preview}
							</p>
						)}

						<span className="mt-auto text-xs text-muted-foreground tabular-nums pt-1">
							{formatRelative(updatedAt)}
						</span>
					</div>
				</Link>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={onEdit}>Renombrar</ContextMenuItem>
				<ContextMenuItem
					className="text-destructive"
					onClick={async () => {
						const displayTitle = title.trim() || "esta nota";
						const ok = await confirm({
							title: `¿Eliminar «${displayTitle}»?`,
							description:
								"La nota se eliminará para siempre. Esta acción no se puede deshacer.",
							confirmLabel: "Eliminar",
							destructive: true,
						});
						if (!ok) return;
						await deleteNoteAction(idNote);
					}}
				>
					Eliminar
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
