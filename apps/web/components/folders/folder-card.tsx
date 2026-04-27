"use client";

import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { deleteFolder, updateFolder } from "@/server/actions/folder-actions";


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
	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<div className="group rounded-lg border p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
					<div className="flex items-center justify-between">
						<h3 className="font-medium truncate">{name}</h3>
						<span className="text-xs text-muted-foreground shrink-0 ml-2">
							{noteCount} notas
						</span>
					</div>
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={onEdit}>Renombrar</ContextMenuItem>
				<ContextMenuItem
					className="text-destructive"
					onClick={async () => {
						await deleteFolder(idFolder);
					}}
				>
					Eliminar
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
