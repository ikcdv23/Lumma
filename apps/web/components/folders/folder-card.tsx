"use client";

import Link from "next/link";
import { Folder, FileText } from "lucide-react";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { deleteFolderAction } from "@/server/folder/folder.actions";
import { useConfirm } from "../confirm/confirm-provider";

type FolderCardProps = {
	idFolder: string;
	name: string;
	noteCount: number;
	onEdit: () => void;
};

export function FolderCard({
	idFolder,
	name,
	noteCount,
	onEdit,
}: FolderCardProps) {
	const confirm = useConfirm();

	const displayName = name.trim() || "esta carpeta";
	const deleteDescription =
		noteCount === 0
			? "La carpeta se eliminará para siempre. Esta acción no se puede deshacer."
			: `Se eliminarán también las ${noteCount} ${noteCount === 1 ? "nota" : "notas"} que contiene. Esta acción no se puede deshacer.`;

	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<Link
					href={`/folders/${idFolder}`}
					className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
				>
					<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
						<Folder className="size-5" />
					</div>
					<div className="flex flex-col gap-1 min-w-0">
						<h3 className="font-medium text-base truncate" title={name}>
							{name}
						</h3>
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<FileText className="size-3" />
							<span>{noteCount} {noteCount === 1 ? "nota" : "notas"}</span>
						</div>
					</div>
				</Link>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={onEdit}>Renombrar</ContextMenuItem>
				<ContextMenuItem
					className="text-destructive"
					onClick={async () => {
						const ok = await confirm({
							title: `¿Eliminar «${displayName}»?`,
							description: deleteDescription,
							confirmLabel: "Eliminar",
							destructive: true,
						});
						if (!ok) return;
						try {
							await deleteFolderAction(idFolder);
							toast.success("Carpeta eliminada");
						} catch (err) {
							console.error("deleteFolderAction failed", err);
							toast.error("No se pudo eliminar la carpeta");
						}
					}}
				>
					Eliminar
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}