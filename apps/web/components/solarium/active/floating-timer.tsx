import { Check, Minus, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingTimer({
	expanded,
	onToggle,
	timerDisplay,
	targetMinutes,
	elapsedMinutes,
	progress,
}: {
	expanded: boolean;
	onToggle: () => void;
	timerDisplay: string;
	targetMinutes: number;
	elapsedMinutes: number;
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
					{timerDisplay}
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
				<div className="text-5xl font-bold tabular-nums">{timerDisplay}</div>
				<div className="mt-1 text-xs text-muted-foreground">
					{targetMinutes} min · {elapsedMinutes} transcurridos
				</div>
			</div>

			<div className="h-1 overflow-hidden rounded-full bg-muted">
				<div
					className="h-full bg-amber-400 transition-all"
					style={{ width: `${progress}%` }}
				/>
			</div>

			{/* TODO: enchufar completeSessionAction */}
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
