"use client";

import { useState } from "react";
import { ChevronDown, Folder, Inbox, Check } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type Option = { id: string; name: string; isInbox?: boolean };

const folders: Option[] = [
	{ id: "inbox", name: "Inbox", isInbox: true },
	{ id: "1", name: "Matemáticas" },
	{ id: "2", name: "Historia" },
	{ id: "3", name: "Inglés" },
	{ id: "4", name: "Física" },
];

export function FolderPickerButton() {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<Option>(folders[0]!);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="group flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 text-sm transition-all hover:border-primary/40 hover:shadow-sm"
			>
				<span className="font-medium">{selected.name}</span>
				<ChevronDown className="size-4 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
			</button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Elige carpeta</DialogTitle>
						<DialogDescription>
							Estudiarás las notas de la carpeta seleccionada
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-1 -mx-2">
						{folders.map((f) => {
							const isSelected = selected.id === f.id;
							const Icon = f.isInbox ? Inbox : Folder;
							return (
								<button
									key={f.id}
									type="button"
									onClick={() => {
										setSelected(f);
										setOpen(false);
									}}
									className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
								>
									<Icon className="size-4 text-primary shrink-0" />
									<span className="flex-1 truncate">{f.name}</span>
									{isSelected && <Check className="size-4 text-primary" />}
								</button>
							);
						})}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
