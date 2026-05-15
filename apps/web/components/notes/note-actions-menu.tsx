"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderInput, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteNoteAction } from "@/server/note/note.actions";
import { MoveToFolderDialog } from "./move-to-folder-dialog";

type Props = {
	noteId: string;
	currentFolderId: string | null;
	/** Donde redirigir tras borrar. Si no se pasa, no redirige (para listas) */
	redirectAfterDelete?: string;
	/** Tamaño/aspecto del trigger */
	triggerVariant?: "ghost" | "subtle";
};

export function NoteActionsMenu({
	noteId,
	currentFolderId,
	redirectAfterDelete,
	triggerVariant = "ghost",
}: Props) {
	const router = useRouter();
	const [moveOpen, setMoveOpen] = useState(false);
	const [isDeleting, startDelete] = useTransition();

	function handleDelete() {
		const ok = window.confirm("¿Seguro que quieres eliminar esta nota?");
		if (!ok) return;

		startDelete(async () => {
			await deleteNoteAction(noteId);
			if (redirectAfterDelete) router.push(redirectAfterDelete);
		});
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant={triggerVariant === "subtle" ? "ghost" : "ghost"}
						size="icon-sm"
						aria-label="Más opciones"
					>
						<MoreHorizontal className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setMoveOpen(true)}>
						<FolderInput className="size-4" />
						Mover a carpeta
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						<Trash2 className="size-4" />
						{isDeleting ? "Eliminando..." : "Eliminar"}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<MoveToFolderDialog
				noteId={noteId}
				currentFolderId={currentFolderId}
				open={moveOpen}
				onOpenChange={setMoveOpen}
			/>
		</>
	);
}
