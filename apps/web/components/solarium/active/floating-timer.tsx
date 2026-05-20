"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Minus, Sun } from "lucide-react";
import { TRANSITIONS } from "@/components/motion";

export function FloatingTimer({
	expanded,
	onToggle,
	timerDisplay,
	targetMinutes,
	elapsedDisplay,
	progress,
	isCompleted,
	inExtraTime = false,
}: {
	expanded: boolean;
	onToggle: () => void;
	timerDisplay: string;
	targetMinutes: number;
	elapsedDisplay: string;
	progress: number;
	isCompleted: boolean;
	inExtraTime?: boolean;
}) {
	return (
		<motion.div
			layout
			transition={TRANSITIONS.spring}
			className={
				expanded
					? "fixed bottom-6 right-6 flex w-72 flex-col gap-3 rounded-xl border bg-card p-4 shadow-md"
					: "fixed bottom-6 right-6"
			}
		>
			{expanded ? (
				<ExpandedTimer
					onToggle={onToggle}
					timerDisplay={timerDisplay}
					targetMinutes={targetMinutes}
					elapsedDisplay={elapsedDisplay}
					progress={progress}
					isCompleted={isCompleted}
					inExtraTime={inExtraTime}
				/>
			) : (
				<CollapsedTimer
					onToggle={onToggle}
					timerDisplay={timerDisplay}
					isCompleted={isCompleted}
					inExtraTime={inExtraTime}
				/>
			)}
		</motion.div>
	);
}

function CollapsedTimer({
	onToggle,
	timerDisplay,
	isCompleted,
	inExtraTime,
}: {
	onToggle: () => void;
	timerDisplay: string;
	isCompleted: boolean;
	inExtraTime: boolean;
}) {
	return (
		<motion.button
			type="button"
			onClick={onToggle}
			layout
			transition={TRANSITIONS.spring}
			className={
				isCompleted || inExtraTime
					? "flex items-center gap-2 rounded-full border border-amber-400 bg-amber-100 px-4 py-2 shadow-sm transition-colors hover:bg-amber-200"
					: "flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 shadow-sm transition-colors hover:bg-amber-100"
			}
			aria-label="Expandir temporizador"
		>
			<motion.div layoutId="timer-icon">
				{isCompleted ? (
					<Check className="size-4 text-amber-600" />
				) : (
					<Sun className="size-4 text-amber-500" />
				)}
			</motion.div>
			<motion.span
				layoutId="timer-label"
				className="text-sm font-semibold text-amber-700 tabular-nums"
			>
				{isCompleted ? "Completada" : timerDisplay}
			</motion.span>
		</motion.button>
	);
}

function ExpandedTimer({
	onToggle,
	timerDisplay,
	targetMinutes,
	elapsedDisplay,
	progress,
	isCompleted,
	inExtraTime,
}: {
	onToggle: () => void;
	timerDisplay: string;
	targetMinutes: number;
	elapsedDisplay: string;
	progress: number;
	isCompleted: boolean;
	inExtraTime: boolean;
}) {
	return (
		<>
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-1.5">
					<motion.div layoutId="timer-icon">
						<Sun className="size-4 text-amber-500" />
					</motion.div>
					<motion.span
						layoutId="timer-label"
						className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
					>
						{isCompleted
							? "Completada"
							: inExtraTime
								? "Tiempo extra"
								: "Pomodoro"}
					</motion.span>
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

			<AnimatePresence mode="wait">
				{isCompleted ? (
					<motion.div
						key="completed"
						initial={{ opacity: 0, scale: 0.92 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={TRANSITIONS.spring}
						className="text-center"
					>
						<div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-100">
							<Check className="size-7 text-amber-600" />
						</div>
						<div className="mt-2 text-sm font-semibold">
							¡Tu cielo brilla un poco más!
						</div>
						<div className="mt-1 text-xs text-muted-foreground">
							{targetMinutes} min cumplidos
						</div>
					</motion.div>
				) : (
					<motion.div
						key="running"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={TRANSITIONS.soft}
						className="text-center"
					>
						<div
							className={`text-5xl font-bold tabular-nums ${
								inExtraTime ? "text-amber-600" : ""
							}`}
						>
							{timerDisplay}
						</div>
						<div className="mt-1 text-xs text-muted-foreground">
							{inExtraTime
								? `${targetMinutes} min cumplidos · seguiremos sumando`
								: `${targetMinutes} min · ${elapsedDisplay} transcurridos`}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{!isCompleted && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ ...TRANSITIONS.soft, delay: 0.1 }}
					className="h-1 overflow-hidden rounded-full bg-muted"
				>
					<motion.div
						className="h-full bg-amber-400"
						initial={{ width: 0 }}
						animate={{ width: `${progress}%` }}
						transition={TRANSITIONS.soft}
					/>
				</motion.div>
			)}
		</>
	);
}
