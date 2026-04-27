"use client";

import { useState } from "react";
import { FolderCard } from "./folder-card";
import { FolderModal } from "./folder-modal";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";

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

	return (
		<>
			<Button onClick={openCreateModal}>
				<FolderPlus className="size-4" />
				Nueva carpeta
			</Button>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

			<FolderModal
				open={modalOpen}
				onOpenChange={setModalOpen}
				folder={folderToEdit ?? undefined}
			/>
		</>
	);
}
