import { ChevronDown, ChevronRight, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type FolderMaterial = {
	id: string;
	name: string;
	notes: { id: string; title: string }[];
};

type LooseNote = {
	id: string;
	title: string;
};

export function MaterialSidebar({
	folders,
	looseNotes,
	hasMaterial,
	selectedNoteId,
	onSelectNote,
	openFolders,
	onToggleFolder,
	onCreateNote,
	creatingNote,
}: {
	folders: FolderMaterial[];
	looseNotes: LooseNote[];
	hasMaterial: boolean;
	selectedNoteId: string | null;
	onSelectNote: (id: string) => void;
	openFolders: Set<string>;
	onToggleFolder: (id: string) => void;
	onCreateNote: () => void;
	creatingNote: boolean;
}) {
	return (
		<aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-r bg-muted/20">
			<div className="flex flex-col gap-1 p-4">
				<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Material
				</h2>

				{!hasMaterial ? (
					<div className="mt-4 rounded-lg border border-dashed p-4 text-xs text-muted-foreground">
						<p className="font-medium text-foreground">Sesión libre</p>
						<p className="mt-1">
							No hay material vinculado. Puedes empezar una nota desde cero.
						</p>
					</div>
				) : (
					<>
						{folders.length > 0 && (
							<div className="mt-2 flex flex-col gap-1">
								<span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
									Carpetas
								</span>
								{folders.map((folder) => {
									const isOpen = openFolders.has(folder.id);
									return (
										<div key={folder.id} className="flex flex-col">
											<button
												type="button"
												onClick={() => onToggleFolder(folder.id)}
												className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted/60"
											>
												{isOpen ? (
													<ChevronDown className="size-3.5 text-muted-foreground" />
												) : (
													<ChevronRight className="size-3.5 text-muted-foreground" />
												)}
												<span className="font-medium">{folder.name}</span>
												<span className="ml-auto text-xs text-muted-foreground tabular-nums">
													{folder.notes.length}
												</span>
											</button>
											{isOpen && (
												<div className="ml-4 flex flex-col">
													{folder.notes.length === 0 ? (
														<span className="px-2 py-1 text-xs text-muted-foreground italic">
															Sin notas en la sesión
														</span>
													) : (
														folder.notes.map((note) => (
															<NoteItem
																key={note.id}
																title={note.title}
																active={selectedNoteId === note.id}
																onClick={() => onSelectNote(note.id)}
															/>
														))
													)}
												</div>
											)}
										</div>
									);
								})}
							</div>
						)}

						{looseNotes.length > 0 && (
							<div className="mt-4 flex flex-col gap-1">
								<span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
									Notas sueltas
								</span>
								{looseNotes.map((note) => (
									<NoteItem
										key={note.id}
										title={note.title}
										active={selectedNoteId === note.id}
										onClick={() => onSelectNote(note.id)}
									/>
								))}
							</div>
						)}
					</>
				)}

				<button
					type="button"
					onClick={onCreateNote}
					disabled={creatingNote}
					className="mt-4 flex items-center gap-1.5 rounded-md border border-dashed px-2 py-2 text-xs text-muted-foreground transition-colors hover:border-amber-400/60 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<Plus className="size-3.5" />
					{creatingNote ? "Creando..." : "Nueva nota en esta sesión"}
				</button>
			</div>
		</aside>
	);
}

function NoteItem({
	title,
	active,
	onClick,
}: {
	title: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
				active
					? "bg-amber-100/60 text-foreground"
					: "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
			)}
		>
			<FileText
				className={cn(
					"size-3.5 shrink-0",
					active ? "text-amber-600" : "text-muted-foreground",
				)}
			/>
			<span className="truncate">{title || "Sin título"}</span>
		</button>
	);
}
