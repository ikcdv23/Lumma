"use client";

import { Check, FileText, FolderClosed, ListTodo, Sun } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	targetMinutes: number;
	elapsedMinutes: number;
	notesCount: number;
	foldersCount: number;
	kanbanDone: number;
	kanbanTotal: number;
	onExit: () => void;
	onStayLonger: () => void;
};

/**
 * Modal de fin de sesión. Lo importante visualmente: sol con gradient
 * (firma de Solarium) + título "Tu sol se ha puesto" como cierre poético.
 * Lo importante de info: minutos totales, materiales usados, tareas
 * cerradas. Newport-style "shutdown ritual" sin gritar logros.
 */
export function CompletionModal({
	open,
	onOpenChange,
	targetMinutes,
	elapsedMinutes,
	notesCount,
	foldersCount,
	kanbanDone,
	kanbanTotal,
	onExit,
	onStayLonger,
}: Props) {
	const minutesLabel = elapsedMinutes === 1 ? "minuto" : "minutos";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-linear-to-br from-amber-300 to-orange-400 shadow-md shadow-amber-500/30">
						<Sun
							className="size-8 text-white"
							strokeWidth={2}
							fill="currentColor"
						/>
					</div>
					<DialogTitle className="text-center text-2xl font-bold tracking-tight">
						Tu sol se ha puesto
					</DialogTitle>
					<DialogDescription className="text-center text-sm">
						Has estudiado{" "}
						<strong className="text-foreground tabular-nums">
							{elapsedMinutes} {minutesLabel}
						</strong>{" "}
						de los <span className="tabular-nums">{targetMinutes}</span> que te
						propusiste.
					</DialogDescription>
				</DialogHeader>

				<div className="my-4 grid grid-cols-3 gap-3">
					<StatTile
						icon={FolderClosed}
						value={foldersCount}
						label={foldersCount === 1 ? "carpeta" : "carpetas"}
					/>
					<StatTile
						icon={FileText}
						value={notesCount}
						label={notesCount === 1 ? "nota" : "notas"}
					/>
					<StatTile
						icon={ListTodo}
						value={`${kanbanDone}/${kanbanTotal}`}
						label="hechas"
						highlight={kanbanTotal > 0 && kanbanDone === kanbanTotal}
					/>
				</div>

				{kanbanTotal > 0 && kanbanDone === kanbanTotal && (
					<p className="flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-600">
						<Check className="size-3.5" />
						Cerraste todas las tareas del tablero.
					</p>
				)}

				<DialogFooter className="mt-2 gap-2 sm:gap-2">
					<Button type="button" variant="ghost" onClick={onStayLonger}>
						Quedarme un poco más
					</Button>
					<Button
						type="button"
						onClick={onExit}
						className="bg-amber-500 hover:bg-amber-600 text-white"
					>
						Cerrar la jornada
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function StatTile({
	icon: Icon,
	value,
	label,
	highlight = false,
}: {
	icon: typeof Sun;
	value: number | string;
	label: string;
	highlight?: boolean;
}) {
	return (
		<div
			className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center ${
				highlight
					? "border-emerald-200 bg-emerald-50/60"
					: "border-border bg-card/40"
			}`}
		>
			<Icon
				className={`size-4 ${highlight ? "text-emerald-600" : "text-muted-foreground"}`}
			/>
			<div className="text-xl font-bold tabular-nums leading-none">{value}</div>
			<div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
				{label}
			</div>
		</div>
	);
}
