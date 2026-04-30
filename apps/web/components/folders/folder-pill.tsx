import Link from "next/link";
import { Folder } from "lucide-react";

type FolderPillProps = {
	idFolder: string;
	name: string;
	noteCount: number;
};

export function FolderPill({ idFolder, name, noteCount }: FolderPillProps) {
	return (
		<Link
			href={`/folders/${idFolder}`}
			className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm transition-all hover:border-primary/40 hover:shadow-sm"
		>
			<Folder className="size-4 text-primary" />
			<span className="font-medium">{name}</span>
			<span className="text-xs text-muted-foreground">{noteCount}</span>
		</Link>
	);
}
