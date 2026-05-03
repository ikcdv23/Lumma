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
import { deleteNote } from "@/server/actions/notes-actions";

type NoteCardProps = {
	idNote: string;
	folderId: string;
	title: string;
	updatedAt: Date;
	onEdit: () => void;
};

export function NoteCard({
	idNote,
	folderId,
	title,
	updatedAt,
	onEdit,
}: NoteCardProps) {
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

					{/* Título + fecha */}
					<div className="flex flex-col gap-1.5 min-w-0">
						<h3
							className="font-semibold text-base leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-primary"
							title={title}
						>
							{title || (
								<span className="font-normal italic text-muted-foreground/60">
									Sin título
								</span>
							)}
						</h3>
						<span className="text-xs text-muted-foreground tabular-nums">
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
						await deleteNote(idNote)
					}}
				>
					Eliminar
				</ContextMenuItem> 
			</ContextMenuContent>
		</ContextMenu>
	);
}
