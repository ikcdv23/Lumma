"use client";

import { useState } from "react";
import {
	Plus,
	Timer,
	Zap,
	Layers,
	Pause,
	Play,
	Sparkles,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Block = {
	type: "focus" | "pause" | "flashcards";
	minutes: number;
};

type Template = {
	name: string;
	desc: string;
	total: string;
	icon: React.ComponentType<{ className?: string }>;
	blocks: Block[];
};

const templates: Template[] = [
	{
		name: "Pomodoro clásico",
		desc: "25/5 · 4 rondas",
		total: "2h",
		icon: Timer,
		blocks: [
			{ type: "focus", minutes: 25 },
			{ type: "pause", minutes: 5 },
			{ type: "focus", minutes: 25 },
			{ type: "pause", minutes: 5 },
			{ type: "focus", minutes: 25 },
			{ type: "pause", minutes: 5 },
			{ type: "focus", minutes: 25 },
		],
	},
	{
		name: "Sprint corto",
		desc: "25min directos",
		total: "25min",
		icon: Zap,
		blocks: [{ type: "focus", minutes: 25 }],
	},
	{
		name: "Repaso flash",
		desc: "Flashcards + Focus",
		total: "40min",
		icon: Layers,
		blocks: [
			{ type: "flashcards", minutes: 10 },
			{ type: "focus", minutes: 25 },
			{ type: "pause", minutes: 5 },
		],
	},
];

export function TemplatesSection() {
	const [previewing, setPreviewing] = useState<Template | null>(null);
	const [creatingOpen, setCreatingOpen] = useState(false);

	return (
		<>
			<section id="plantillas" className="flex flex-col gap-3 scroll-mt-8">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-medium text-muted-foreground">
						Plantillas
					</h2>
					<button
						type="button"
						className="text-xs text-muted-foreground hover:text-foreground transition-colors"
					>
						Ver todas →
					</button>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
					{templates.map((t) => {
						const Icon = t.icon;
						return (
							<button
								key={t.name}
								type="button"
								onClick={() => setPreviewing(t)}
								className="group flex flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
							>
								<div className="flex items-center justify-between">
									<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
										<Icon className="size-4" />
									</div>
									<span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
										{t.total}
									</span>
								</div>
								<div className="flex flex-col gap-0.5 min-w-0">
									<h3 className="font-semibold text-sm truncate">{t.name}</h3>
									<p className="text-xs text-muted-foreground truncate">
										{t.desc}
									</p>
								</div>
							</button>
						);
					})}
					<button
						type="button"
						onClick={() => setCreatingOpen(true)}
						className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/10 p-4 text-muted-foreground transition-all hover:border-primary/40 hover:bg-muted/20 hover:text-foreground"
					>
						<Plus className="size-5 transition-transform group-hover:rotate-90" />
						<span className="text-xs font-medium">Crear plantilla</span>
					</button>
				</div>
			</section>

			<TemplatePreviewModal
				template={previewing}
				onClose={() => setPreviewing(null)}
			/>

			<CreateTemplateModal
				open={creatingOpen}
				onOpenChange={setCreatingOpen}
			/>
		</>
	);
}

// ─────────────────────────────────────────────
// Preview de plantilla
// ─────────────────────────────────────────────
function TemplatePreviewModal({
	template,
	onClose,
}: {
	template: Template | null;
	onClose: () => void;
}) {
	if (!template) return null;
	const Icon = template.icon;

	return (
		<Dialog open={!!template} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-start gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
							<Icon className="size-5" />
						</div>
						<div className="flex-1 min-w-0">
							<DialogTitle>{template.name}</DialogTitle>
							<DialogDescription className="mt-0.5">
								Total: {template.total} · {template.blocks.length} bloques
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="flex flex-col gap-1.5 my-2">
					<h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
						Secuencia
					</h4>
					{template.blocks.map((block, i) => {
						const BlockIcon =
							block.type === "focus"
								? Play
								: block.type === "pause"
									? Pause
									: Sparkles;
						const blockLabel =
							block.type === "focus"
								? "Focus"
								: block.type === "pause"
									? "Pausa"
									: "Flashcards";
						const isFocus = block.type === "focus";

						return (
							<div
								key={i}
								className="flex items-center gap-3 rounded-md bg-muted/30 px-3 py-2"
							>
								<span className="w-4 text-xs tabular-nums text-muted-foreground/60">
									{i + 1}
								</span>
								<BlockIcon
									className={`size-4 ${isFocus ? "text-primary" : "text-muted-foreground"}`}
								/>
								<span className="flex-1 text-sm font-medium">{blockLabel}</span>
								<span className="text-xs tabular-nums text-muted-foreground">
									{block.minutes} min
								</span>
							</div>
						);
					})}
				</div>

				<DialogFooter className="flex flex-row gap-2 sm:justify-end">
					<Button variant="outline" onClick={onClose}>
						Cancelar
					</Button>
					<Button onClick={onClose}>Empezar con esta</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ─────────────────────────────────────────────
// Crear plantilla
// ─────────────────────────────────────────────
function CreateTemplateModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Crear plantilla</DialogTitle>
					<DialogDescription>
						Define una secuencia que puedas reutilizar después
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4 my-2">
					<div className="flex flex-col gap-1.5">
						<label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
							Nombre
						</label>
						<input
							type="text"
							placeholder="Mi plantilla"
							className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
							Bloques
						</label>
						<div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
							<p className="text-sm text-muted-foreground">
								Constructor de bloques
							</p>
							<p className="text-xs text-muted-foreground/60 mt-1">
								(builder drag-drop · pendiente)
							</p>
						</div>
					</div>
				</div>

				<DialogFooter className="flex flex-row gap-2 sm:justify-end">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					<Button onClick={() => onOpenChange(false)}>Crear plantilla</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
