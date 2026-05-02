"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Inbox, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { NoteEditor } from "@/components/notes/blocknote";

export default function MockupNoteC() {
	const [title, setTitle] = useState("Apuntes clase de Álgebra");
	const [content, setContent] = useState(
		"Vectores y combinaciones lineales.\n\n" +
			"Hoy hemos visto la definición de espacio vectorial:\n" +
			"- Conjunto cerrado bajo suma\n" +
			"- Conjunto cerrado bajo multiplicación por escalar\n\n" +
			"Próxima clase: subespacios y bases.",
	);

	return (
		<div className="flex flex-col h-full mt-50">
			{/* Top bar minimalista */}
			<div className="flex items-center justify-between gap-4 px-6 py-3">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/home">
						<ArrowLeft className="size-4" />
						Volver
					</Link>
				</Button>

				<div className="flex items-center gap-3">
					<SaveIndicator status="saved" />
					<button
						type="button"
						className="flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium transition-all hover:border-primary/40 hover:shadow-sm"
					>
						<Inbox className="size-3.5 text-primary" />
						Inbox
					</button>
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
					<NoteEditor onChange={console.log("hola que ase")} />
				</div>
			</div>
		</div>
	);
}
