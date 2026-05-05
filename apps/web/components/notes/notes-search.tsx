"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatRelative } from "@/lib/format-date";
import { searchNotes } from "@/server/actions/notes-actions";

type SearchResult = {
	id: string;
	title: string;
	updatedAt: Date;
};

export function NotesSearch() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Debounce: espera 250ms tras la ultima tecla antes de pegar al server
	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		const timeout = setTimeout(async () => {
			const data = await searchNotes(query);
			setResults(data);
			setIsLoading(false);
		}, 250);

		return () => clearTimeout(timeout);
	}, [query]);

	// Cerrar dropdown al hacer click fuera o pulsar Escape
	useEffect(() => {
		function onClickOutside(e: MouseEvent) {
			if (!containerRef.current?.contains(e.target as Node)) {
				setIsOpen(false);
			}
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") setIsOpen(false);
		}
		document.addEventListener("mousedown", onClickOutside);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onClickOutside);
			document.removeEventListener("keydown", onKey);
		};
	}, []);

	function handleSelect(noteId: string) {
		setIsOpen(false);
		setQuery("");
		router.push(`/notes/${noteId}`);
	}

	const showDropdown = isOpen && query.trim().length > 0;

	return (
		<div ref={containerRef} className="relative lg-full max-w-md">
			<div className="relative">
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Buscar notas..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => setIsOpen(true)}
					className="h-9 pl-9 pr-9"
				/>
				{query && (
					<button
						type="button"
						onClick={() => {
							setQuery("");
							setResults([]);
						}}
						className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
						aria-label="Limpiar busqueda"
					>
						<X className="size-3.5" />
					</button>
				)}
			</div>

			{showDropdown && (
				<div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border bg-popover shadow-lg">
					{isLoading ? (
						<div className="px-4 py-6 text-center text-sm text-muted-foreground">
							Buscando...
						</div>
					) : results.length === 0 ? (
						<div className="px-4 py-6 text-center text-sm text-muted-foreground">
							Sin resultados para &quot;{query}&quot;
						</div>
					) : (
						<ul className="max-h-80 overflow-y-auto py-1">
							{results.map((note) => (
								<li key={note.id}>
									<button
										type="button"
										onClick={() => handleSelect(note.id)}
										className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
									>
										<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
											<FileText className="size-4" />
										</div>
										<div className="flex min-w-0 flex-1 flex-col">
											<span className="truncate text-sm font-medium">
												{note.title || (
													<span className="italic text-muted-foreground">
														Sin titulo
													</span>
												)}
											</span>
											<span className="text-xs text-muted-foreground">
												{formatRelative(note.updatedAt)}
											</span>
										</div>
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}
