"use client";

import { useState } from "react";
import {
	Check,
	LayoutGrid,
	ListTodo,
	NotebookPen,
	Sun,
	X,
	type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AbandonModal } from "./abandon-modal";

type Tab = "notas" | "tareas" | "tablero";

export function ActiveTopbar({
	title,
	activeTab,
	onTabChange,
	onAbandon,
	abandonPending,
	elapsedMinutes,
	isCompleted,
	onExit,
	inExtraTime = false,
	onCloseDay,
}: {
	title: string;
	activeTab: Tab;
	onTabChange: (tab: Tab) => void;
	onAbandon: () => void;
	abandonPending: boolean;
	elapsedMinutes: number;
	isCompleted: boolean;
	onExit: () => void;
	inExtraTime?: boolean;
	onCloseDay?: () => void;
}) {
	const [confirmOpen, setConfirmOpen] = useState(false);

	return (
		<header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
			<div className="flex items-center gap-2">
				<Sun className="size-5 text-amber-500" />
				<span className="text-sm font-semibold">{title}</span>
				{isCompleted && (
					<span className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
						<Check className="size-3" />
						Completada
					</span>
				)}
				{inExtraTime && !isCompleted && (
					<span className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
						✨ Tiempo extra
					</span>
				)}
			</div>

			<div className="flex flex-1 justify-center">
				<div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
					<TabButton
						icon={NotebookPen}
						label="Notas"
						active={activeTab === "notas"}
						onClick={() => onTabChange("notas")}
					/>
					<TabButton
						icon={ListTodo}
						label="Tareas"
						active={activeTab === "tareas"}
						onClick={() => onTabChange("tareas")}
					/>
					<TabButton
						icon={LayoutGrid}
						label="Tablero"
						active={activeTab === "tablero"}
						onClick={() => onTabChange("tablero")}
					/>
				</div>
			</div>

			{isCompleted ? (
				<button
					type="button"
					onClick={onExit}
					className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-600"
				>
					<Check className="size-4" />
					Salir
				</button>
			) : inExtraTime ? (
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setConfirmOpen(true)}
						className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-red-400/60 hover:text-foreground"
					>
						<X className="size-4" />
						Abandonar
					</button>
					<button
						type="button"
						onClick={onCloseDay}
						className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-600"
					>
						<Check className="size-4" />
						Cerrar la jornada
					</button>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setConfirmOpen(true)}
					className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-red-400/60 hover:text-foreground"
				>
					<X className="size-4" />
					Abandonar
				</button>
			)}

			<AbandonModal
				open={confirmOpen}
				pending={abandonPending}
				elapsedMinutes={elapsedMinutes}
				onCancel={() => setConfirmOpen(false)}
				onConfirm={onAbandon}
			/>
		</header>
	);
}

function TabButton({
	icon: Icon,
	label,
	active,
	onClick,
}: {
	icon: LucideIcon;
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
