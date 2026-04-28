"use client";

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FilePlus } from "lucide-react";
import { useState, useEffect } from "react";

type NoteModalProps = {
	folderId: string;
	note?: {
		id: string;
		title: string;
	};
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function NoteModal({
	folderId,
	note,
	open,
	onOpenChange,
}: NoteModalProps) {
	const [title, setTitle] = useState(note?.title ?? "");
	const isEditing = !!note;
	const isEmpty = title.trim() === "";

	useEffect(() => {
		setTitle(note?.title ?? "");
	}, [note]);

	async function handleSave() {
		// TODO: si isEditing → updateNote(note.id, { title })
		// TODO: si NO isEditing → createNote(folderId, title)
		setTitle("");
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md rounded-xl">
				<DialogHeader>
					<DialogTitle className="text-2xl">
						{isEditing ? "Renombrar nota" : "Nueva nota"}
					</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col gap-2">
					<Label htmlFor="note-title">Titulo</Label>
					<Input
						id="note-title"
						placeholder="Ej: Apuntes clase 1, Ideas..."
						autoFocus
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="focus-visible:ring-2 focus-visible:ring-primary"
					/>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						type="button"
						onClick={() => onOpenChange(false)}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						disabled={isEmpty}
						onClick={handleSave}
					>
						<FilePlus className="size-4" />
						{isEditing ? "Guardar" : "Crear nota"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
