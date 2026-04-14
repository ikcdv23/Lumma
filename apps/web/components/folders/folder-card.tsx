// components/folders/folder-card.tsx

// 1. Defines qué props acepta (como los @props de Blade)
type FolderCardProps = {
	name: string;
	noteCount: number;
};

// 2. Creas la función que devuelve el JSX
export function FolderCard({ name, noteCount }: FolderCardProps) {
	return (
		<div className="group rounded-lg border p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
			<div className="flex items-center justify-between">
				<h3 className="font-medium truncate">{name}</h3>
				<span className="text-xs text-muted-foreground shrink-0 ml-2">
					{noteCount} notas
				</span>
			</div>
		</div>
	);
}
