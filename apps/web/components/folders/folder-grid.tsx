"use client";

import { useState } from "react";
import { FolderCard } from "./folder-card";
import { FolderModal } from "./folder-modal";
import { Button } from "@/components/ui/button";
import { FolderPlus, FolderOpen } from "lucide-react";

type Folder = {
	id: string;
	name: string;
	_count: { notes: number };
};

type FoldersGridProps = {
	folders: Folder[];
};

export function FoldersGrid({ folders }: FoldersGridProps) {
	const [modalOpen, setModalOpen] = useState(false);
	const [folderToEdit, setFolderToEdit] = useState<{
		id: string;
		name: string;
	} | null>(null);

	function openCreateModal() {
		setFolderToEdit(null);
		setModalOpen(true);
	}

	function openEditModal(folder: { id: string; name: string }) {
		setFolderToEdit(folder);
		setModalOpen(true);
	}

	const isEmpty = folders.length === 0;

	return (
		<>
			<div className="flex items-start justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h1 className="text-3xl font-bold tracking-tight">Mis carpetas</h1>
					<p className="text-sm text-muted-foreground">
						{isEmpty
							? "Empieza creando tu primera carpeta"
							: `${folders.length} ${folders.length === 1 ? "carpeta" : "carpetas"}`}
					</p>
				</div>
				{!isEmpty && (
					<Button onClick={openCreateModal}>
						<FolderPlus className="size-4" />
						Nueva carpeta
					</Button>
				)}
			</div>

			{isEmpty ? (
				<div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 px-6 text-center">
					<div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
						<FolderOpen className="size-8" />
					</div>
					<div className="flex flex-col gap-1">
						<h3 className="text-lg font-semibold">Aun no tienes carpetas</h3>
						<p className="text-sm text-muted-foreground max-w-xs">
							Crea tu primera carpeta para empezar a organizar tus notas
						</p>
					</div>
					<Button onClick={openCreateModal} variant="outline">
						<FolderPlus className="size-4" />
						Crear mi primera carpeta
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{folders.map((folder) => (
						<FolderCard
							key={folder.id}
							idFolder={folder.id}
							name={folder.name}
							noteCount={folder._count.notes}
							onEdit={() => openEditModal({ id: folder.id, name: folder.name })}
						/>
					))}
				</div>
			)}

			<FolderModal
				open={modalOpen}
				onOpenChange={setModalOpen}
				folder={folderToEdit ?? undefined}
			/>
		</>
	);
}
