// components/folders/folder-card.tsx
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";

type FolderCardProps = {
	name: string;
	noteCount: number;
};

export function FolderCard({ name, noteCount }: FolderCardProps) {
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
				<ContextMenuItem>Renombrar</ContextMenuItem>
				<ContextMenuItem className="text-destructive">Eliminar</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
