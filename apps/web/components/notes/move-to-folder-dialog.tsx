"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Folder as FolderIcon, Inbox, Check, Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { indexFolders } from "@/server/actions/folder-actions";
import { moveNoteToFolder } from "@/server/actions/notes-actions";

type Folder = { id: string; name: string };

type Props = {
	noteId: string;
	currentFolderId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onMoved?: (newFolderId: string | null) => void;
};

export function MoveToFolderDialog({
	noteId,
	currentFolderId,
	open,
	onOpenChange,
	onMoved,
}: Props) {
	const [folders, setFolders] = useState<Folder[] | null>(null);
	const [pendingId, setPendingId] = useState<string | null | "__inbox__">(null);
	const [isPending, startTransition] = useTransition();

	// Cargar carpetas al abrir
	useEffect(() => {
		if (!open) return;
		setFolders(null);
		indexFolders().then((data) => {
			setFolders(data ?? []);
		});
	}, [open]);

	function handlePick(targetFolderId: string | null) {
		setPendingId(targetFolderId ?? "__inbox__");
		startTransition(async () => {
			await moveNoteToFolder(noteId, targetFolderId);
			onMoved?.(targetFolderId);
			setPendingId(null);
			onOpenChange(false);
		});
	}

	const isCurrent = (id: string | null) => id === currentFolderId;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Mover a carpeta</DialogTitle>
					<DialogDescription>
						Elige el destino de la nota
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-1 -mx-2">
					{/* Inbox siempre disponible */}
					<FolderRow
						icon={<Inbox className="size-4 text-primary" />}
						label="Inbox"
						current={isCurrent(null)}
						pending={pendingId === "__inbox__" && isPending}
						onClick={() => !isCurrent(null) && handlePick(null)}
					/>

					<div className="my-2 h-px bg-border" />

					<AnimatePresence mode="popLayout">
						{folders === null ? (
							<motion.div
								key="loader"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="flex items-center justify-center py-6"
							>
								<Loader2 className="size-4 animate-spin text-muted-foreground" />
							</motion.div>
						) : folders.length === 0 ? (
							<motion.p
								key="empty"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="px-3 py-6 text-center text-sm text-muted-foreground"
							>
								No tienes carpetas aún
							</motion.p>
						) : (
							folders.map((f, i) => (
								<motion.div
									key={f.id}
									initial={{ opacity: 0, y: 4 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.15, delay: i * 0.02 }}
								>
									<FolderRow
										icon={<FolderIcon className="size-4 text-primary" />}
										label={f.name}
										current={isCurrent(f.id)}
										pending={pendingId === f.id && isPending}
										onClick={() => !isCurrent(f.id) && handlePick(f.id)}
									/>
								</motion.div>
							))
						)}
					</AnimatePresence>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function FolderRow({
	icon,
	label,
	current,
	pending,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	current: boolean;
	pending: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={current || pending}
			className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
		>
			{icon}
			<span className="flex-1 truncate">{label}</span>
			{pending ? (
				<Loader2 className="size-4 animate-spin text-muted-foreground" />
			) : current ? (
				<Check className="size-4 text-primary" />
			) : null}
		</button>
	);
}
