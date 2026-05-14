"use client";

import { useState } from "react";
import { Bookmark, Check } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function SaveAsTemplateButton() {
	const [open, setOpen] = useState(false);
	const [saved, setSaved] = useState(false);

	function handleSave() {
		setSaved(true);
		setTimeout(() => {
			setOpen(false);
			setTimeout(() => setSaved(false), 500);
		}, 800);
	}

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
			>
				<Bookmark className="size-3.5" />
				Guardar como plantilla
			</button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Guardar como plantilla</DialogTitle>
						<DialogDescription>
							Reutiliza esta configuración en futuras sesiones
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-1.5 my-2">
						<label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
							Nombre
						</label>
						<input
							type="text"
							placeholder="Pomodoro Inglés"
							disabled={saved}
							defaultValue="Sesión 25 min · Inbox"
							className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors disabled:opacity-60"
						/>
					</div>

					<DialogFooter className="flex flex-row gap-2 sm:justify-end">
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleSave} disabled={saved}>
							{saved ? (
								<>
									<Check className="size-4" /> Guardada
								</>
							) : (
								"Guardar"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
