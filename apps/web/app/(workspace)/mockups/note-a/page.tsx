"use client";

import { useState } from "react";
import Link from "next/link";
import {
	ChevronRight,
	FolderInput,
	Inbox,
	MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveIndicator } from "@/components/ui/save-indicator";

export default function MockupNoteA() {
	const [title, setTitle] = useState("Apuntes clase de Álgebra");
	const [content, setContent] = useState(
		"Vectores y combinaciones lineales.\n\n" +
			"Hoy hemos visto la definición de espacio vectorial:\n" +
			"- Conjunto cerrado bajo suma\n" +
			"- Conjunto cerrado bajo multiplicación por escalar\n\n" +
			"Próxima clase: subespacios y bases.",
	);

	return (
		<div className="flex flex-col h-full mt-30">
			{/* Top bar con breadcrumb */}
			<div className="flex items-center justify-between gap-4 border-b px-6 py-3">
				<nav className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
					<Link
						href="/inbox"
						className="flex items-center gap-1.5 hover:text-foreground transition-colors"
					>
						<Inbox className="size-3.5" />
						Inbox
					</Link>
					<ChevronRight className="size-3.5 shrink-0" />
					<span className="text-foreground font-medium truncate">
						{title || "Sin título"}
					</span>
				</nav>

				<div className="flex items-center gap-2">
					<SaveIndicator status="saved" />
					<Button variant="ghost" size="sm">
						<FolderInput className="size-4" />
						Mover
					</Button>
					<Button variant="ghost" size="icon-sm" aria-label="Más opciones">
						<MoreHorizontal className="size-4" />
					</Button>
				</div>
			</div>

			{/* Body */}
			<div className="flex-1 overflow-auto">
				<div className="mx-auto w-full max-w-3xl px-8 py-12 md:px-12 md:py-16">
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Sin título"
						className="w-full bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/40"
					/>
					<p className="mt-2 text-xs text-muted-foreground">
						Última edición: hace 5 minutos
					</p>
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						rows={20}
						placeholder="Empieza a escribir..."
						className="mt-8 w-full bg-transparent text-base leading-relaxed outline-none resize-none placeholder:text-muted-foreground/40"
					/>
				</div>
			</div>
		</div>
	);
}
