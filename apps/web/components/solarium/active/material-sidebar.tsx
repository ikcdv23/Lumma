"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
	ChevronDown,
	ChevronRight,
	FileText,
	FolderInput,
	FolderMinus,
	FolderPlus,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { PulseDot } from "@/components/loaders";
import { cn } from "@/lib/utils";
import { FolderModal } from "@/components/folders/folder-modal";
import { MoveToFolderDialog } from "@/components/notes/move-to-folder-dialog";
import {
	createFolderInActiveSessionAction,
	createNoteInActiveSessionAction,
	detachFolderFromActiveSessionAction,
} from "@/server/solarium/solarium.actions";
import { deleteFolderAction } from "@/server/folder/folder.actions";
import { deleteNoteAction } from "@/server/note/note.actions";
import { useConfirm } from "@/components/confirm/confirm-provider";

type FolderMaterial = {
	id: string;
	name: string;
	notes: { id: string; title: string }[];
};

type LooseNote = {
	id: string;
	title: string;
};

type Props = {
	folders: FolderMaterial[];
	looseNotes: LooseNote[];
	hasMaterial: boolean;
	selectedNoteId: string | null;
	onSelectNote: (id: string | null) => void;
	openFolders: Set<string>;
	onToggleFolder: (id: string) => void;
};

export function MaterialSidebar({
	folders,
	looseNotes,
	hasMaterial,
	selectedNoteId,
	onSelectNote,
	openFolders,
	onToggleFolder,
}: Props) {
	const router = useRouter();
	const confirm = useConfirm();
	const [isCreatingNote, startCreateNoteTransition] = useTransition();
	const [isCreatingFolder, startCreateFolderTransition] = useTransition();

	const [folderModalOpen, setFolderModalOpen] = useState(false);
	const [folderBeingEdited, setFolderBeingEdited] = useState<
		{ id: string; name: string } | undefined
	>(undefined);

	const [moveNoteOpen, setMoveNoteOpen] = useState(false);
	const [noteBeingMoved, setNoteBeingMoved] = useState<
		{ id: string; currentFolderId: string | null } | null
	>(null);

	function handleCreateNote() {
		startCreateNoteTransition(async () => {
			const created = await createNoteInActiveSessionAction();
			if (created) {
				onSelectNote(created.id);
				router.refresh();
			}
		});
	}

	function handleCreateFolder() {
		startCreateFolderTransition(async () => {
			const created = await createFolderInActiveSessionAction();
			if (created) {
				router.refresh();
			}
		});
	}

	function handleRenameFolder(folder: { id: string; name: string }) {
		setFolderBeingEdited(folder);
		setFolderModalOpen(true);
	}

	async function handleDetachFolder(folderId: string) {
		const folder = folders.find((f) => f.id === folderId);
		const displayName = folder?.name.trim() || "esta carpeta";

		const ok = await confirm({
			title: `¿Quitar «${displayName}» de la sesión?`,
			description:
				"La carpeta seguirá existiendo en tu workspace. Sólo deja de aparecer en el material de esta sesión.",
			confirmLabel: "Quitar de la sesión",
		});
		if (!ok) return;

		await detachFolderFromActiveSessionAction(folderId);
		router.refresh();
	}

	async function handleDeleteFolder(folderId: string) {
		const folder = folders.find((f) => f.id === folderId);
		const displayName = folder?.name.trim() || "esta carpeta";
		const noteCount = folder?.notes.length ?? 0;

		const ok = await confirm({
			title: `¿Eliminar «${displayName}»?`,
			description:
				noteCount === 0
					? "La carpeta se eliminará para siempre. Esta acción no se puede deshacer."
					: `Se eliminarán también las ${noteCount} ${noteCount === 1 ? "nota" : "notas"} que contiene. Esta acción no se puede deshacer.`,
			confirmLabel: "Eliminar",
			destructive: true,
		});
		if (!ok) return;

		await deleteFolderAction(folderId);
		router.refresh();
	}

	function handleMoveNote(noteId: string, currentFolderId: string | null) {
		setNoteBeingMoved({ id: noteId, currentFolderId });
		setMoveNoteOpen(true);
	}

	async function handleDeleteNote(noteId: string) {
		const note =
			folders.flatMap((f) => f.notes).find((n) => n.id === noteId) ??
			looseNotes.find((n) => n.id === noteId);
		const displayTitle = note?.title.trim() || "esta nota";

		const ok = await confirm({
			title: `¿Eliminar «${displayTitle}»?`,
			description:
				"La nota se eliminará para siempre. Esta acción no se puede deshacer.",
			confirmLabel: "Eliminar",
			destructive: true,
		});
		if (!ok) return;

		await deleteNoteAction(noteId);
		if (noteId === selectedNoteId) onSelectNote(null);
		router.refresh();
	}

	return (
		<>
			<aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-r bg-muted/20">
				<div className="flex flex-col gap-1 p-4">
					<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Material
					</h2>

					{!hasMaterial ? (
						<div className="mt-4 rounded-lg border border-dashed p-4 text-xs text-muted-foreground">
							<p className="font-medium text-foreground">Sesión libre</p>
							<p className="mt-1">
								No hay material vinculado. Puedes empezar una nota o
								carpeta desde cero.
							</p>
						</div>
					) : (
						<>
							{folders.length > 0 && (
								<div className="mt-2 flex flex-col gap-1">
									<span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
										Carpetas
									</span>
									{folders.map((folder) => (
										<FolderRow
											key={folder.id}
											folder={folder}
											isOpen={openFolders.has(folder.id)}
											selectedNoteId={selectedNoteId}
											onToggle={() => onToggleFolder(folder.id)}
											onSelectNote={onSelectNote}
											onRename={() =>
												handleRenameFolder({
													id: folder.id,
													name: folder.name,
												})
											}
											onDetach={() => handleDetachFolder(folder.id)}
											onDelete={() => handleDeleteFolder(folder.id)}
											onMoveNote={handleMoveNote}
											onDeleteNote={handleDeleteNote}
										/>
									))}
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
											onMove={() => handleMoveNote(note.id, null)}
											onDelete={() => handleDeleteNote(note.id)}
										/>
									))}
								</div>
							)}
						</>
					)}

					<div className="mt-4 flex flex-col gap-2">
						<button
							type="button"
							onClick={handleCreateNote}
							disabled={isCreatingNote}
							className="flex items-center gap-1.5 rounded-md border border-dashed px-2 py-2 text-xs text-muted-foreground transition-colors hover:border-amber-400/60 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isCreatingNote ? (
								<>
									<PulseDot />
									Creando nota
								</>
							) : (
								<>
									<Plus className="size-3.5" />
									Nueva nota en esta sesión
								</>
							)}
						</button>

						<button
							type="button"
							onClick={handleCreateFolder}
							disabled={isCreatingFolder}
							className="flex items-center gap-1.5 rounded-md border border-dashed px-2 py-2 text-xs text-muted-foreground transition-colors hover:border-amber-400/60 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isCreatingFolder ? (
								<>
									<PulseDot />
									Creando carpeta
								</>
							) : (
								<>
									<FolderPlus className="size-3.5" />
									Nueva carpeta en esta sesión
								</>
							)}
						</button>
					</div>
				</div>
			</aside>

			<FolderModal
				folder={folderBeingEdited}
				open={folderModalOpen}
				onOpenChange={(o) => {
					setFolderModalOpen(o);
					if (!o) setFolderBeingEdited(undefined);
				}}
			/>

			{noteBeingMoved && (
				<MoveToFolderDialog
					noteId={noteBeingMoved.id}
					currentFolderId={noteBeingMoved.currentFolderId}
					open={moveNoteOpen}
					onOpenChange={(o) => {
						setMoveNoteOpen(o);
						if (!o) setNoteBeingMoved(null);
					}}
					onMoved={() => router.refresh()}
				/>
			)}
		</>
	);
}

function FolderRow({
	folder,
	isOpen,
	selectedNoteId,
	onToggle,
	onSelectNote,
	onRename,
	onDetach,
	onDelete,
	onMoveNote,
	onDeleteNote,
}: {
	folder: FolderMaterial;
	isOpen: boolean;
	selectedNoteId: string | null;
	onToggle: () => void;
	onSelectNote: (id: string) => void;
	onRename: () => void;
	onDetach: () => void;
	onDelete: () => void;
	onMoveNote: (noteId: string, currentFolderId: string | null) => void;
	onDeleteNote: (noteId: string) => void;
}) {
	const displayName = folder.name.trim() || "Sin nombre";

	return (
		<div className="flex flex-col">
			<ContextMenu>
				<ContextMenuTrigger asChild>
					<button
						type="button"
						onClick={onToggle}
						className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted/60"
					>
						{isOpen ? (
							<ChevronDown className="size-3.5 text-muted-foreground" />
						) : (
							<ChevronRight className="size-3.5 text-muted-foreground" />
						)}
						<span
							className={cn(
								"font-medium truncate",
								!folder.name.trim() && "italic text-muted-foreground",
							)}
						>
							{displayName}
						</span>
						<span className="ml-auto text-xs text-muted-foreground tabular-nums">
							{folder.notes.length}
						</span>
					</button>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onClick={onRename}>
						<Pencil className="size-4" />
						Renombrar
					</ContextMenuItem>
					<ContextMenuItem onClick={onDetach}>
						<FolderMinus className="size-4" />
						Quitar de la sesión
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem className="text-destructive" onClick={onDelete}>
						<Trash2 className="size-4" />
						Eliminar carpeta
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

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
								onMove={() => onMoveNote(note.id, folder.id)}
								onDelete={() => onDeleteNote(note.id)}
							/>
						))
					)}
				</div>
			)}
		</div>
	);
}

function NoteItem({
	title,
	active,
	onClick,
	onMove,
	onDelete,
}: {
	title: string;
	active: boolean;
	onClick: () => void;
	onMove: () => void;
	onDelete: () => void;
}) {
	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
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
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={onMove}>
					<FolderInput className="size-4" />
					Mover a carpeta
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem className="text-destructive" onClick={onDelete}>
					<Trash2 className="size-4" />
					Eliminar nota
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
