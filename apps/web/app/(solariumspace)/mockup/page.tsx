"use client";

import { useState } from "react";
import {
	Check,
	ChevronDown,
	ChevronRight,
	FileText,
	Hammer,
	LayoutGrid,
	ListTodo,
	Minus,
	NotebookPen,
	Plus,
	Sun,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Datos hardcoded — esto es solo maqueta, no BD
// ─────────────────────────────────────────────────────────────
const SESSION_TITLE = "Sesión del 13 may";
const TARGET_MINUTES = 50;
const ELAPSED_MINUTES = 8;
const TIMER_DISPLAY = "42:17";

const FOLDERS = [
	{
		id: "f1",
		name: "Matemáticas",
		notes: [
			{ id: "n1", title: "Álgebra lineal" },
			{ id: "n2", title: "Cálculo diferencial" },
		],
	},
	{
		id: "f2",
		name: "Historia",
		notes: [{ id: "n3", title: "Roma antigua" }],
	},
];

const LOOSE_NOTES = [
	{ id: "n4", title: "Brain dump" },
	{ id: "n5", title: "Apuntes hoy" },
];

const SAMPLE_NOTE_CONTENT = {
	title: "Álgebra lineal",
	blocks: [
		"Las matrices son objetos matemáticos que representan transformaciones lineales entre espacios vectoriales.",
		"Una matriz de m×n tiene m filas y n columnas. La transpuesta intercambia filas por columnas.",
		"El determinante de una matriz cuadrada nos dice si la transformación es invertible: si det(A) ≠ 0, la matriz tiene inversa.",
		"Operaciones básicas: suma componente a componente, producto matricial (no conmutativo), multiplicación por escalar.",
	],
};

type Tab = "notas" | "tareas" | "tablero";

export default function MockupPage() {
	const [activeTab, setActiveTab] = useState<Tab>("notas");
	const [selectedNoteId, setSelectedNoteId] = useState<string>("n1");
	const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(["f1"]));
	const [timerExpanded, setTimerExpanded] = useState(false);

	const toggleFolder = (id: string) => {
		setOpenFolders((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const progress = (ELAPSED_MINUTES / TARGET_MINUTES) * 100;

	return (
		<div className="flex h-screen flex-col bg-background">
			{/* ───────── Topbar ───────── */}
			<header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
				{/* Brand de la sesión */}
				<div className="flex items-center gap-2">
					<Sun className="size-5 text-amber-500" />
					<span className="text-sm font-semibold">{SESSION_TITLE}</span>
				</div>

				{/* Tabs centradas */}
				<div className="flex flex-1 justify-center">
					<div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
						<TabButton
							icon={NotebookPen}
							label="Notas"
							active={activeTab === "notas"}
							onClick={() => setActiveTab("notas")}
						/>
						<TabButton
							icon={ListTodo}
							label="Tareas"
							active={activeTab === "tareas"}
							onClick={() => setActiveTab("tareas")}
						/>
						<TabButton
							icon={LayoutGrid}
							label="Tablero"
							active={activeTab === "tablero"}
							onClick={() => setActiveTab("tablero")}
						/>
					</div>
				</div>

				{/* Cerrar sesión */}
				<button
					type="button"
					className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-amber-400/60 hover:text-foreground"
				>
					<X className="size-4" />
					Terminar
				</button>
			</header>

			{/* ───────── Contenido por tab ───────── */}
			<main className="flex flex-1 overflow-hidden">
				{activeTab === "notas" && (
					<NotasTab
						selectedNoteId={selectedNoteId}
						onSelectNote={setSelectedNoteId}
						openFolders={openFolders}
						onToggleFolder={toggleFolder}
					/>
				)}
				{activeTab === "tareas" && <ComingSoon icon={ListTodo} title="Tareas" />}
				{activeTab === "tablero" && (
					<ComingSoon icon={LayoutGrid} title="Tablero" />
				)}
			</main>

			{/* ───────── Timer flotante ───────── */}
			<FloatingTimer
				expanded={timerExpanded}
				onToggle={() => setTimerExpanded((e) => !e)}
				progress={progress}
			/>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────
// Tab button
// ─────────────────────────────────────────────────────────────
function TabButton({
	icon: Icon,
	label,
	active,
	onClick,
}: {
	icon: typeof NotebookPen;
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
				active
					? "bg-background text-foreground shadow-sm"
					: "text-muted-foreground hover:text-foreground",
			)}
		>
			<Icon className="size-4" />
			{label}
		</button>
	);
}

// ─────────────────────────────────────────────────────────────
// Tab Notas — sub-sidebar + editor
// ─────────────────────────────────────────────────────────────
function NotasTab({
	selectedNoteId,
	onSelectNote,
	openFolders,
	onToggleFolder,
}: {
	selectedNoteId: string;
	onSelectNote: (id: string) => void;
	openFolders: Set<string>;
	onToggleFolder: (id: string) => void;
}) {
	return (
		<>
			{/* Sub-sidebar */}
			<aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-r bg-muted/20">
				<div className="flex flex-col gap-1 p-4">
					<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Material
					</h2>

					{/* Carpetas */}
					<div className="mt-2 flex flex-col gap-1">
						<span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
							Carpetas
						</span>
						{FOLDERS.map((folder) => {
							const isOpen = openFolders.has(folder.id);
							return (
								<div key={folder.id} className="flex flex-col">
									<button
										type="button"
										onClick={() => onToggleFolder(folder.id)}
										className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted/60"
									>
										{isOpen ? (
											<ChevronDown className="size-3.5 text-muted-foreground" />
										) : (
											<ChevronRight className="size-3.5 text-muted-foreground" />
										)}
										<span className="font-medium">{folder.name}</span>
										<span className="ml-auto text-xs text-muted-foreground tabular-nums">
											{folder.notes.length}
										</span>
									</button>
									{isOpen && (
										<div className="ml-4 flex flex-col">
											{folder.notes.map((note) => (
												<NoteItem
													key={note.id}
													title={note.title}
													active={selectedNoteId === note.id}
													onClick={() => onSelectNote(note.id)}
												/>
											))}
										</div>
									)}
								</div>
							);
						})}
					</div>

					{/* Notas sueltas */}
					<div className="mt-4 flex flex-col gap-1">
						<span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
							Notas sueltas
						</span>
						{LOOSE_NOTES.map((note) => (
							<NoteItem
								key={note.id}
								title={note.title}
								active={selectedNoteId === note.id}
								onClick={() => onSelectNote(note.id)}
							/>
						))}
					</div>

					{/* Nueva nota */}
					<button
						type="button"
						className="mt-4 flex items-center gap-1.5 rounded-md border border-dashed px-2 py-2 text-xs text-muted-foreground transition-colors hover:border-amber-400/60 hover:text-foreground"
					>
						<Plus className="size-3.5" />
						Nueva nota en esta sesión
					</button>
				</div>
			</aside>

			{/* Editor */}
			<section className="flex flex-1 flex-col overflow-y-auto">
				<div className="mx-auto w-full max-w-3xl px-8 py-12">
					<h1 className="text-3xl font-bold tracking-tight">
						{SAMPLE_NOTE_CONTENT.title}
					</h1>
					<div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-foreground/90">
						{SAMPLE_NOTE_CONTENT.blocks.map((p, i) => (
							<p key={i}>{p}</p>
						))}
					</div>

					<div className="mt-12 rounded-lg border border-dashed border-muted p-6 text-center text-xs text-muted-foreground">
						↑ Aquí iría el editor BlockNote real con autosave
					</div>
				</div>
			</section>
		</>
	);
}

function NoteItem({
	title,
	active,
	onClick,
}: {
	title: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
				active
					? "bg-amber-100/60 text-foreground"
					: "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
			)}
		>
			<FileText
				className={cn(
					"size-3.5 shrink-0",
					active ? "text-amber-600" : "text-muted-foreground",
				)}
			/>
			<span className="truncate">{title}</span>
		</button>
	);
}

// ─────────────────────────────────────────────────────────────
// Coming soon (tabs no implementadas)
// ─────────────────────────────────────────────────────────────
function ComingSoon({
	icon: Icon,
	title,
}: {
	icon: typeof NotebookPen;
	title: string;
}) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
			<div className="flex size-16 items-center justify-center rounded-2xl bg-amber-50">
				<Icon className="size-7 text-amber-500" />
			</div>
			<div className="flex flex-col items-center gap-1 text-center">
				<h3 className="text-lg font-semibold">{title}</h3>
				<p className="text-sm text-muted-foreground">
					Próximamente — estamos cocinando esto
				</p>
				<div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
					<Hammer className="size-3.5" />
					<span>En desarrollo</span>
				</div>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────
// Floating timer (colapsado / expandido)
// ─────────────────────────────────────────────────────────────
function FloatingTimer({
	expanded,
	onToggle,
	progress,
}: {
	expanded: boolean;
	onToggle: () => void;
	progress: number;
}) {
	if (!expanded) {
		return (
			<button
				type="button"
				onClick={onToggle}
				className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 shadow-sm transition-colors hover:bg-amber-100"
				aria-label="Expandir temporizador"
			>
				<Sun className="size-4 text-amber-500" />
				<span className="text-sm font-semibold text-amber-700 tabular-nums">
					{TIMER_DISPLAY}
				</span>
			</button>
		);
	}

	return (
		<div className="fixed bottom-6 right-6 flex w-72 flex-col gap-3 rounded-xl border bg-card p-4 shadow-md">
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-1.5">
					<Sun className="size-4 text-amber-500" />
					<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						Pomodoro
					</span>
				</div>
				<button
					type="button"
					onClick={onToggle}
					className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
					aria-label="Colapsar temporizador"
				>
					<Minus className="size-3.5" />
				</button>
			</div>

			<div className="text-center">
				<div className="text-5xl font-bold tabular-nums">{TIMER_DISPLAY}</div>
				<div className="mt-1 text-xs text-muted-foreground">
					{TARGET_MINUTES} min · {ELAPSED_MINUTES} transcurridos
				</div>
			</div>

			<div className="h-1 overflow-hidden rounded-full bg-muted">
				<div
					className="h-full bg-amber-400 transition-all"
					style={{ width: `${progress}%` }}
				/>
			</div>

			<Button
				size="sm"
				className="w-full bg-amber-500 hover:bg-amber-600 text-white"
			>
				<Check className="size-4" />
				Completar
			</Button>
		</div>
	);
}
