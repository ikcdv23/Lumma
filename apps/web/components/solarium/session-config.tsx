"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
	Check,
	FileText,
	Folder as FolderIcon,
	MoreHorizontal,
	Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { createSessionAction } from "@/server/solarium/solarium.actions";
import { Spinner } from "@/components/loaders";
import { FolderContentsModal } from "./folder-contents-modal";

type FolderItem = {
	id: string;
	name: string;
	_count: { notes: number };
	notes: { id: string; title: string }[];
};
type NoteItem = {
	id: string;
	title: string;
};

const DURATIONS = [25, 50, 90] as const;

export function SessionConfig({
	folders,
	notes,
}: {
	folders: FolderItem[];
	notes: NoteItem[];
}) {
	const router = useRouter();
	const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
	const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
	const [excludedNoteIds, setExcludedNoteIds] = useState<Set<string>>(new Set());
	const [modalFolderId, setModalFolderId] = useState<string | null>(null);
	const [duration, setDuration] = useState<number>(50);
	const [isPending, startTransition] = useTransition();

	// Notas implícitas: notas en carpetas seleccionadas que NO están excluidas
	const implicitNoteIds = useMemo(() => {
		const set = new Set<string>();
		for (const fid of selectedFolders) {
			const folder = folders.find((f) => f.id === fid);
			folder?.notes.forEach((n) => {
				if (!excludedNoteIds.has(n.id)) set.add(n.id);
			});
		}
		return set;
	}, [selectedFolders, folders, excludedNoteIds]);

	// Total único de notas accesibles en la sesión (implícitas ∪ explícitas)
	const totalNotesInSession = useMemo(() => {
		const all = new Set(implicitNoteIds);
		selectedNotes.forEach((id) => all.add(id));
		return all.size;
	}, [implicitNoteIds, selectedNotes]);

	const toggleFolder = (id: string) => {
		setSelectedFolders((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleNote = (id: string) => {
		setSelectedNotes((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleExcluded = (noteId: string) => {
		setExcludedNoteIds((prev) => {
			const next = new Set(prev);
			if (next.has(noteId)) next.delete(noteId);
			else next.add(noteId);
			return next;
		});
	};

	const modalFolder = modalFolderId
		? folders.find((f) => f.id === modalFolderId)
		: null;

	const handleStart = () => {
		startTransition(async () => {
			// Resolver noteIds finales: explícitas + (notas de folders − excluidas)
			const finalNoteIds = new Set<string>(selectedNotes);
			for (const fid of selectedFolders) {
				const folder = folders.find((f) => f.id === fid);
				folder?.notes.forEach((n) => {
					if (!excludedNoteIds.has(n.id)) finalNoteIds.add(n.id);
				});
			}

			const result = await createSessionAction({
				title: null,
				folderIds: Array.from(selectedFolders),
				noteIds: Array.from(finalNoteIds),
				targetMinutes: duration,
			});
			if (result) {
				router.push("/active");
			}
		});
	};

	return (
		<div className="flex flex-col gap-10">
			{/* Material picker */}
			<section className="flex flex-col gap-3">
				<div className="flex items-baseline justify-between">
					<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
						Tu material
					</h2>
					{totalNotesInSession > 0 && (
						<span className="text-xs text-muted-foreground tabular-nums">
							{totalNotesInSession} {totalNotesInSession === 1 ? "nota" : "notas"} en la sesión
						</span>
					)}
				</div>

				<Tabs defaultValue="folders" className="w-full">
					<TabsList className="grid w-full grid-cols-2 max-w-sm">
						<TabsTrigger value="folders">
							Carpetas
							{folders.length > 0 && (
								<span className="ml-1.5 text-muted-foreground">
									({folders.length})
								</span>
							)}
						</TabsTrigger>
						<TabsTrigger value="notes">
							Inbox
							{notes.length > 0 && (
								<span className="ml-1.5 text-muted-foreground">
									({notes.length})
								</span>
							)}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="folders" className="mt-4">
						{folders.length === 0 ? (
							<p className="text-sm text-muted-foreground py-12 text-center border border-dashed rounded-lg">
								Aún no tienes carpetas
							</p>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
								{folders.map((f) => {
									const isSelected = selectedFolders.has(f.id);
									return (
										<div key={f.id} className="relative">
											<button
												type="button"
												onClick={() => toggleFolder(f.id)}
												className={cn(
													"w-full flex items-center gap-3 rounded-lg border p-3 pr-10 text-left text-sm transition-colors",
													isSelected
														? "border-amber-400 bg-amber-50/50 ring-1 ring-amber-300"
														: "hover:border-amber-400/60",
												)}
											>
												<div
													className={cn(
														"flex size-8 shrink-0 items-center justify-center rounded-md",
														isSelected
															? "bg-amber-100 text-amber-700"
															: "bg-muted text-muted-foreground",
													)}
												>
													{isSelected ? (
														<Check className="size-4" />
													) : (
														<FolderIcon className="size-4" />
													)}
												</div>
												<div className="flex flex-col min-w-0 flex-1">
													<span className="truncate font-medium">{f.name}</span>
													<span className="text-xs text-muted-foreground">
														{f._count.notes}{" "}
														{f._count.notes === 1 ? "nota" : "notas"}
													</span>
												</div>
											</button>
											{isSelected && f._count.notes > 0 && (
												<button
													type="button"
													onClick={() => setModalFolderId(f.id)}
													className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-amber-100 hover:text-amber-700 transition-colors"
													aria-label={`Ver notas de ${f.name}`}
												>
													<MoreHorizontal className="size-4" />
												</button>
											)}
										</div>
									);
								})}
							</div>
						)}
					</TabsContent>

					<TabsContent value="notes" className="mt-4">
						{notes.length === 0 ? (
							<p className="text-sm text-muted-foreground py-12 text-center border border-dashed rounded-lg">
								Aún no tienes notas
							</p>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
								{notes.map((n) => {
									const isExplicit = selectedNotes.has(n.id);
									const isImplicit = implicitNoteIds.has(n.id);
									const isSelected = isExplicit || isImplicit;

									return (
										<button
											key={n.id}
											type="button"
											disabled={isImplicit}
											onClick={() => !isImplicit && toggleNote(n.id)}
											title={
												isImplicit
													? `Incluida por una carpeta seleccionada`
													: undefined
											}
											className={cn(
												"flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
												isExplicit && "border-amber-400 bg-amber-50/50 ring-1 ring-amber-300",
												isImplicit && "border-muted-foreground/20 bg-muted/30 cursor-not-allowed",
												!isSelected && "hover:border-amber-400/60",
											)}
										>
											<div
												className={cn(
													"flex size-8 shrink-0 items-center justify-center rounded-md",
													isExplicit && "bg-amber-100 text-amber-700",
													isImplicit && "bg-muted text-muted-foreground/60",
													!isSelected && "bg-muted text-muted-foreground",
												)}
											>
												{isSelected ? (
													<Check className="size-4" />
												) : (
													<FileText className="size-4" />
												)}
											</div>
											<div className="flex flex-col min-w-0 flex-1">
												<span
													className={cn(
														"truncate font-medium",
														isImplicit && "text-muted-foreground",
													)}
												>
													{n.title || "Sin título"}
												</span>
											</div>
										</button>
									);
								})}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</section>

			{/* Duration picker */}
			<section className="flex flex-col gap-3">
				<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
					Duración
				</h2>
				<div className="flex gap-3">
					{DURATIONS.map((d) => {
						const isSelected = duration === d;
						return (
							<button
								key={d}
								type="button"
								onClick={() => setDuration(d)}
								className={cn(
									"flex-1 rounded-xl border p-5 text-center transition-colors",
									isSelected
										? "border-amber-400 bg-amber-50/50 ring-1 ring-amber-300"
										: "hover:border-amber-400/60",
								)}
							>
								<div className="text-3xl font-bold tabular-nums">{d}</div>
								<div className="text-xs text-muted-foreground mt-0.5">min</div>
							</button>
						);
					})}
				</div>
			</section>

			{/* Submit */}
			<Button
				onClick={handleStart}
				disabled={isPending}
				size="lg"
				className="bg-amber-500 hover:bg-amber-600 text-white"
			>
				{isPending ? (
					<>
						<Spinner size="sm" className="border-white border-t-transparent" />
						Iniciando
					</>
				) : (
					<>
						<Zap className="size-5" strokeWidth={2} />
						Empezar a estudiar
					</>
				)}
			</Button>

			{/* Modal de contenido de carpeta */}
			{modalFolder && (
				<FolderContentsModal
					open={modalFolderId !== null}
					onClose={() => setModalFolderId(null)}
					folderName={modalFolder.name}
					notes={modalFolder.notes}
					excludedNoteIds={excludedNoteIds}
					onToggleExclude={toggleExcluded}
				/>
			)}
		</div>
	);
}
