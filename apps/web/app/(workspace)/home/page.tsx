import Link from "next/link";
import { Inbox } from "lucide-react";
import { auth } from "@/auth";
import { FolderPill } from "@/components/folders/folder-pill";
import FastNotes from "@/components/notes/fast-note-card";
import { indexFolders } from "@/server/actions/folder-actions";
import { getInboxCount } from "@/server/actions/notes-actions";

export const metadata = {
	title: "Inicio",
};

export default async function HomePage() {
	const session = await auth();
	const userName = session?.user?.name ?? "tu";
	const folders = (await indexFolders()) ?? [];
	const inboxCount = await getInboxCount();

	return (
		<div className="flex flex-col gap-10 p-6 md:p-12 w-full max-w-4xl mx-auto">
			<FastNotes userName={userName} />

			<div>
				<h2 className="text-sm font-medium text-muted-foreground">
					Tus carpetas
				</h2>
				<div className="flex flex-wrap gap-2">
					<Link
						href="/inbox"
						className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm transition-all hover:border-primary/40 hover:shadow-sm"
					>
						<Inbox className="size-4 text-primary" />
						<span className="font-medium">Inbox</span>
						<span className="text-xs text-muted-foreground">
							{inboxCount}
						</span>
					</Link>
					{folders.map((folder) => (
						<FolderPill
							key={folder.id}
							idFolder={folder.id}
							name={folder.name}
							noteCount={folder._count.notes}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
