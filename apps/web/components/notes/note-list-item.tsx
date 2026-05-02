import Link from "next/link";
import { NotepadText } from "lucide-react";

type NoteListItemProps = {
	id: string;
	title: string;
	folderName: string | null;
	updatedAt: Date;
};

// Devuelve "ahora", "hace 5 min", "hace 3h", "ayer", "hace 5 días", etc.
function formatRelative(date: Date): string {
	const diffMs = Date.now() - new Date(date).getTime();
	const diffMin = Math.floor(diffMs / 60_000);

	if (diffMin < 1) return "ahora";
	if (diffMin < 60) return `hace ${diffMin} min`;

	const diffH = Math.floor(diffMin / 60);
	if (diffH < 24) return `hace ${diffH}h`;

	const diffD = Math.floor(diffH / 24);
	if (diffD === 1) return "ayer";
	if (diffD < 30) return `hace ${diffD} días`;

	const diffMo = Math.floor(diffD / 30);
	if (diffMo < 12) return `hace ${diffMo} ${diffMo === 1 ? "mes" : "meses"}`;

	const diffY = Math.floor(diffMo / 12);
	return `hace ${diffY} ${diffY === 1 ? "año" : "años"}`;
}

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
				{formatRelative(updatedAt)}
			</time>
		</Link>
	);
}
