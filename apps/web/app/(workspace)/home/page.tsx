import Link from "next/link";
import FastNotes from "@/components/notes/fast-note-card";
import { Inbox } from "lucide-react";
import { auth } from "@/auth";
import { FolderPill } from "@/components/folders/folder-pill";
import { indexFolders } from "@/server/actions/folder-actions";
import { getInboxCount, getRecentNotes } from "@/server/actions/notes-actions";
import { NoteListItem } from "@/components/notes/note-list-item";

export const metadata = {
	title: "Inicio",
};

export default async function HomePage() {
	const session = await auth();
	const userName = session?.user?.name ?? "tu";
	const folders = (await indexFolders()) ?? [];
	const inboxCount = await getInboxCount();
	const recentNotes = await getRecentNotes(10);

	return (
		<div className="flex flex-col gap-10 p-6 md:p-12 w-full max-w-4xl mx-auto mt-30">
			<FastNotes userName={userName} />

			<section>
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
						<span className="text-xs text-muted-foreground">{inboxCount}</span>
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
			</section>
			<section className="flex flex-col gap-3">
				<h2 className="text-sm font-medium text-muted-foreground">Notas recientes</h2>
				<div className="flex flex-col">
					{/* Cabecera de columnas */}
					<div className="flex items-center gap-3 border-b px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
						<div className="size-4 shrink-0" />
						<span className="flex-1">Título</span>
						<span className="w-28 shrink-0 text-right">Carpeta</span>
						<span className="w-28 shrink-0 text-right">Actividad</span>
					</div>

					{/* Lista de notas (o empty state) */}
					{recentNotes.length === 0 ? (
						<p className="px-3 py-6 text-center text-sm text-muted-foreground">
							Aún no tienes notas. Crea una rápida arriba para empezar.
						</p>
					) : (
						<ul className="flex flex-col">
							{recentNotes.map((recentNote) => (
								<li key={recentNote.id}>
									<NoteListItem
										id={recentNote.id}
										title={recentNote.title}
										folderName={recentNote.folder?.name ?? null}
										updatedAt={recentNote.updatedAt}
									/>
								</li>
							))}
						</ul>
					)}
				</div>
			</section>
		</div>
	);
}
