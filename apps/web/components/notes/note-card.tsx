"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";

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
	const formattedDate = new Intl.DateTimeFormat("es-ES", {
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(updatedAt);

	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<Link
					href={`/folders/${folderId}/${idNote}`}
					className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
				>
					<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
						<FileText className="size-5" />
					</div>
					<div className="flex flex-col gap-1 min-w-0">
						<h3 className="font-medium text-base truncate" title={title}>
							{title || "Sin titulo"}
						</h3>
						<span className="text-xs text-muted-foreground">
							Editado el {formattedDate}
						</span>
					</div>
				</Link>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={onEdit}>Renombrar</ContextMenuItem>
				<ContextMenuItem
					className="text-destructive"
					onClick={() => {
						// TODO: llamar a deleteNote(idNote)
					}}
				>
					Eliminar
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
