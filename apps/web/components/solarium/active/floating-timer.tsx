import { Check, Minus, Sun } from "lucide-react";

export function FloatingTimer({
	expanded,
	onToggle,
	timerDisplay,
	targetMinutes,
	elapsedMinutes,
	progress,
	isCompleted,
}: {
	expanded: boolean;
	onToggle: () => void;
	timerDisplay: string;
	targetMinutes: number;
	elapsedMinutes: number;
	progress: number;
	isCompleted: boolean;
}) {
	if (!expanded) {
		return (
			<button
				type="button"
				onClick={onToggle}
				className={
					isCompleted
						? "fixed bottom-6 right-6 flex items-center gap-2 rounded-full border border-amber-400 bg-amber-100 px-4 py-2 shadow-sm transition-colors hover:bg-amber-200"
						: "fixed bottom-6 right-6 flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 shadow-sm transition-colors hover:bg-amber-100"
				}
				aria-label="Expandir temporizador"
			>
				{isCompleted ? (
					<>
						<Check className="size-4 text-amber-600" />
						<span className="text-sm font-semibold text-amber-700">
							Completada
						</span>
					</>
				) : (
					<>
						<Sun className="size-4 text-amber-500" />
						<span className="text-sm font-semibold text-amber-700 tabular-nums">
							{timerDisplay}
						</span>
					</>
				)}
			</button>
		);
	}

	return (
		<div className="fixed bottom-6 right-6 flex w-72 flex-col gap-3 rounded-xl border bg-card p-4 shadow-md">
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-1.5">
					<Sun className="size-4 text-amber-500" />
					<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						{isCompleted ? "Completada" : "Pomodoro"}
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
				{isCompleted ? (
					<>
						<div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-100">
							<Check className="size-7 text-amber-600" />
						</div>
						<div className="mt-2 text-sm font-semibold">
							¡Tu cielo brilla un poco más!
						</div>
						<div className="mt-1 text-xs text-muted-foreground">
							{targetMinutes} min cumplidos
						</div>
					</>
				) : (
					<>
						<div className="text-5xl font-bold tabular-nums">{timerDisplay}</div>
						<div className="mt-1 text-xs text-muted-foreground">
							{targetMinutes} min · {elapsedMinutes} transcurridos
						</div>
					</>
				)}
			</div>

			{!isCompleted && (
				<div className="h-1 overflow-hidden rounded-full bg-muted">
					<div
						className="h-full bg-amber-400 transition-all"
						style={{ width: `${progress}%` }}
					/>
				</div>
			)}
		</div>
	);
}
