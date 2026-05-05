import { Inbox } from "lucide-react";
import { getInboxNotes } from "@/server/actions/notes-actions";
import { NoteListItem } from "@/components/notes/note-list-item";

export const metadata = {
	title: "Inbox",
};

export default async function InboxPage() {
	const recentNotes = await getInboxNotes();
	const isEmpty = recentNotes.length === 0;

	return (
		<div className="flex flex-col gap-6 p-6 md:p-8 w-full max-w-5xl mx-auto">
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					<Inbox className="size-7 text-primary" />
					<h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
				</div>
				<p className="text-sm text-muted-foreground">
					{isEmpty
						? "No tienes notas rapidas pendientes"
						: `${recentNotes.length} ${recentNotes.length === 1 ? "nota rapida" : "notas rapidas"}`}
				</p>
			</div>

			<section className="flex flex-col gap-3">
				<h2 className="text-sm font-medium text-muted-foreground">
					Notas recientes
				</h2>
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
										folderId={recentNote.folderId}
										folderName={null}
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
