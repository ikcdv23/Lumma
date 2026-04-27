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
import { FolderPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { createFolder, updateFolder } from "@/server/actions/folder-actions";

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

	// Sincroniza el input cuando cambia la carpeta (al abrir modal con otra)
	useEffect(() => {
		setName(folder?.name ?? "");
	}, [folder]);

	async function handleSave() {
		if (isEditing) {
			await updateFolder(folder.id, name);
		} else {
			await createFolder(name);
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
				<div className="flex flex-col gap-2">
					<Label htmlFor="folder-name">Nombre</Label>
					<Input
						id="folder-name"
						placeholder="Ej: Matemáticas, Proyecto final..."
						autoFocus
						value={name}
						onChange={(e) => setName(e.target.value)}
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
						<FolderPlus className="size-4" />
						{isEditing ? "Guardar" : "Crear carpeta"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
