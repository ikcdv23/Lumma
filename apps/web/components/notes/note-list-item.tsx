import Link from "next/link";
import { NotepadText } from "lucide-react";

type NoteListItemProps = {
	id: string;
	title: string;
	folderName: string | null;
	updatedAt: Date;
};

export function NoteListItem({
	id,
	title,
	folderName,
	updatedAt,
}: NoteListItemProps) {
	return (
		<Link
			href={`/notes/${id}`}
			className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/40"
		>
			<NotepadText className="size-4 shrink-0 text-muted-foreground" />
			<span className="flex-1 truncate font-medium">{title || <span className="text-muted-foreground">Sin Título</span>}</span>
			<span className="w-28 shrink-0 truncate text-right text-xs text-muted-foreground">
				{folderName ?? "Inbox"}
			</span>
			<time
				className="w-28 shrink-0 text-right text-xs text-muted-foreground"
				dateTime={updatedAt.toISOString()}
			>
				{updatedAt.toLocaleDateString("es-ES")}
			</time>
		</Link>
	);
}
