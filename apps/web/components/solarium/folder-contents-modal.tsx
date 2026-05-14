"use client";

import { Check, FileText, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type NoteRef = { id: string; title: string };

type Props = {
	open: boolean;
	onClose: () => void;
	folderName: string;
	notes: NoteRef[];
	excludedNoteIds: Set<string>;
	onToggleExclude: (noteId: string) => void;
};

export function FolderContentsModal({
	open,
	onClose,
	folderName,
	notes,
	excludedNoteIds,
	onToggleExclude,
}: Props) {
	const includedCount = notes.length - excludedNoteIds.size;

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Notas de &ldquo;{folderName}&rdquo;</DialogTitle>
					<DialogDescription>
						{includedCount} de {notes.length}{" "}
						{notes.length === 1 ? "nota incluida" : "notas incluidas"} en la sesión.
						Quita las que no quieras estudiar hoy.
					</DialogDescription>
				</DialogHeader>

				{notes.length === 0 ? (
					<p className="text-sm text-muted-foreground py-6 text-center">
						Esta carpeta no tiene notas todavía
					</p>
				) : (
					<div className="flex flex-col gap-1 max-h-80 overflow-y-auto -mx-2 px-2">
						{notes.map((n) => {
							const isExcluded = excludedNoteIds.has(n.id);
							return (
								<div
									key={n.id}
									className={cn(
										"flex items-center gap-2 rounded-md py-2 px-2 transition-colors",
										isExcluded ? "opacity-50" : "hover:bg-muted/50",
									)}
								>
									<div
										className={cn(
											"flex size-6 shrink-0 items-center justify-center rounded",
											isExcluded
												? "bg-muted text-muted-foreground"
												: "bg-amber-100 text-amber-700",
										)}
									>
										{isExcluded ? (
											<FileText className="size-3.5" />
										) : (
											<Check className="size-3.5" />
										)}
									</div>
									<span
										className={cn(
											"flex-1 text-sm truncate",
											isExcluded && "line-through text-muted-foreground",
										)}
									>
										{n.title || "Sin título"}
									</span>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => onToggleExclude(n.id)}
										className="h-7 text-xs"
									>
										{isExcluded ? (
											<>
												<RotateCcw className="size-3.5" />
												Incluir
											</>
										) : (
											<>
												<X className="size-3.5" />
												Quitar
											</>
										)}
									</Button>
								</div>
							);
						})}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
