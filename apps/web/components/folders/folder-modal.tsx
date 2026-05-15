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
import { useState, useEffect } from "react";
import {
	createFolderAction,
	updateFolderAction,
} from "@/server/folder/folder.actions";
import { SaveFolderButton } from "./save-folder-button";

type FolderModalProps = {
	folder?: {
		id: string;
		name: string;
	};
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function FolderModal({ folder, open, onOpenChange }: FolderModalProps) {
	const [name, setName] = useState(folder?.name ?? "");
	const isEditing = !!folder;
	const isEmpty = name.trim() === "";

	useEffect(() => {
		setName(folder?.name ?? "");
	}, [folder]);

	async function handleSubmit() {
		if (isEditing) {
			await updateFolderAction(folder.id, name);
		} else {
			await createFolderAction(name);
		}
		setName("");
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md rounded-xl">
				<DialogHeader>
					<DialogTitle className="text-2xl">
						{isEditing ? "Editar carpeta" : "Nueva carpeta"}
					</DialogTitle>
				</DialogHeader>
				<form action={handleSubmit}>
					<div className="flex flex-col gap-2">
						<Label htmlFor="folder-name">Nombre</Label>
						<Input
							id="folder-name"
							name="name"
							placeholder="Ej: Matemáticas, Proyecto final..."
							autoFocus
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="focus-visible:ring-2 focus-visible:ring-primary"
						/>
					</div>
					<DialogFooter className="mt-4">
						<Button
							variant="outline"
							type="button"
							onClick={() => onOpenChange(false)}
						>
							Cancelar
						</Button>
						<SaveFolderButton isEditing={isEditing} disabled={isEmpty} />
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
