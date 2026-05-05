import Link from "next/link";
import { NotepadText } from "lucide-react";
import { formatRelative } from "@/lib/format-date";
import { NoteActionsMenu } from "@/components/notes/note-actions-menu";

type NoteListItemProps = {
	id: string;
	title: string;
	folderId: string | null;
	folderName: string | null;
	updatedAt: Date;
};

export function NoteListItem({
	id,
	title,
	folderId,
	folderName,
	updatedAt,
}: NoteListItemProps) {
	return (
		<div className="group flex items-center gap-3 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-muted/40">
			<NotepadText className="size-4 shrink-0 text-muted-foreground" />
			<Link
				href={`/notes/${id}`}
				className="flex flex-1 items-center gap-3 min-w-0 px-1 py-1"
			>
				<span className="flex-1 truncate font-medium">
					{title || (
						<span className="text-muted-foreground">Sin Título</span>
					)}
				</span>
				<span className="w-28 shrink-0 truncate text-right text-xs text-muted-foreground">
					{folderName ?? "Inbox"}
				</span>
				<time
					className="w-28 shrink-0 text-right text-xs text-muted-foreground"
					dateTime={updatedAt.toISOString()}
				>
					{formatRelative(updatedAt)}
				</time>
			</Link>
			<div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
				<NoteActionsMenu noteId={id} currentFolderId={folderId} />
			</div>
		</div>
	);
}
