"use client";

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import { useState } from "react";
import { createFolder, indexFolders } from "@/server/actions/folder-actions";

export function CreateFolderModal() {
	const [name, setName] = useState("");
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<FolderPlus className="size-4" />
					Nueva carpeta
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Nueva carpeta</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col gap-2">
					<Input
						id="folder-name"
						placeholder="Ej: Matemáticas, Proyecto final..."
						autoFocus
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						type="button"
						onClick={() => {
							setOpen(false);
						}}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						onClick={async () => {
							await createFolder(name);
							setName("");
							setOpen(false);
						}}
					>
						<FolderPlus className="size-4" />
						Crear carpeta
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
