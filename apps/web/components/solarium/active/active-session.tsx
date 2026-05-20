"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, ListTodo } from "lucide-react";
import {
	abandonSessionAction,
	completeSessionAction,
	heartbeatAction,
} from "@/server/solarium/solarium.actions";
import { useNavigationGuard } from "@/hooks/use-navigation-guard";
import { ActiveTopbar } from "./active-topbar";
import { ComingSoon } from "./coming-soon";
import { FloatingTimer } from "./floating-timer";
import { MaterialSidebar } from "./material-sidebar";
import { ActiveNoteEditor } from "./active-note-editor";
import { AbandonModal } from "./abandon-modal";
import { CompletionModal } from "./completion-modal";

type FolderMaterial = {
	id: string;
	name: string;
	notes: { id: string; title: string; content: unknown }[];
};

type LooseNote = {
	id: string;
	title: string;
	content: unknown;
};

type Tab = "notas" | "tareas" | "tablero";

type Props = {
	sessionId: string;
	title: string;
	targetMinutes: number;
	initialRemainingSeconds: number;
	folders: FolderMaterial[];
	looseNotes: LooseNote[];
};

const HEARTBEAT_INTERVAL_MS = 45_000;

export function ActiveSession({
	sessionId,
	title,
	targetMinutes,
	initialRemainingSeconds,
	folders,
	looseNotes,
}: Props) {
	const router = useRouter();
	const [isAbandoning, startAbandonTransition] = useTransition();

	const allNotes = useMemo(() => {
		const list: { id: string; title: string; content: unknown }[] = [];
		folders.forEach((f) => f.notes.forEach((n) => list.push(n)));
		looseNotes.forEach((n) => list.push(n));
		return list;
	}, [folders, looseNotes]);

	const [activeTab, setActiveTab] = useState<Tab>("notas");
	const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
		allNotes[0]?.id ?? null,
	);
	const [openFolders, setOpenFolders] = useState<Set<string>>(
		new Set(folders.map((f) => f.id)),
	);
	const [timerExpanded, setTimerExpanded] = useState(false);
	const [remainingSeconds, setRemainingSeconds] = useState(
		initialRemainingSeconds,
	);
	const [isCompleted, setIsCompleted] = useState(
		initialRemainingSeconds === 0,
	);

	// Modal de cierre + pending state
	const [completionOpen, setCompletionOpen] = useState(false);
	const [isCompleting, startCompleteTransition] = useTransition();

	// Tick: cuenta hacia abajo hasta 0, después cuenta hacia arriba (tiempo extra)
	useEffect(() => {
		if (isCompleted) return;
		const id = setInterval(() => {
			setRemainingSeconds((s) => s - 1);
		}, 1000);
		return () => clearInterval(id);
	}, [isCompleted]);

	useEffect(() => {
		if (isCompleted || isAbandoning) return;
		const id = setInterval(() => {
			heartbeatAction(sessionId);
		}, HEARTBEAT_INTERVAL_MS);
		return () => clearInterval(id);
	}, [sessionId, isCompleted, isAbandoning]);

	const targetSeconds = targetMinutes * 60;
	// inExtraTime: el timer pasó 0 pero la sesión sigue activa
	const inExtraTime = remainingSeconds <= 0 && !isCompleted;
	const extraSeconds = inExtraTime ? -remainingSeconds : 0;

	// Display: cuando estamos en extra, mostramos "+MM:SS" en vez del countdown
	const displaySeconds = inExtraTime ? extraSeconds : remainingSeconds;
	const displayMinutesPart = Math.floor(Math.abs(displaySeconds) / 60);
	const displaySecondsPart = Math.abs(displaySeconds) % 60;
	const timerDisplay = inExtraTime
		? `+${String(displayMinutesPart).padStart(2, "0")}:${String(displaySecondsPart).padStart(2, "0")}`
		: `${String(displayMinutesPart).padStart(2, "0")}:${String(displaySecondsPart).padStart(2, "0")}`;

	// elapsedSeconds: tiempo total estudiado (target alcanzado + extra si lo hay)
	const elapsedSeconds = inExtraTime
		? targetSeconds + extraSeconds
		: targetSeconds - remainingSeconds;
	const elapsedMinutes = Math.floor(elapsedSeconds / 60);
	const elapsedDisplay = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;
	const extraMinutes = Math.floor(extraSeconds / 60);
	const progress = inExtraTime ? 100 : (elapsedSeconds / targetSeconds) * 100;

	// Title de la pestaña: cuando hay extra, te enteras aunque estés en otra tab
	useEffect(() => {
		const original = document.title;
		if (inExtraTime) document.title = "✨ Tu sol se ha puesto · Lumma";
		return () => {
			document.title = original;
		};
	}, [inExtraTime]);

	const elapsedMinutesRef = useRef(elapsedMinutes);
	useEffect(() => {
		elapsedMinutesRef.current = elapsedMinutes;
	}, [elapsedMinutes]);

	const { pendingHref, isConfirming, confirmExit, cancelExit } =
		useNavigationGuard({
			when: !isCompleted && !isAbandoning,
			onConfirmExit: async () => {
				await abandonSessionAction(
					sessionId,
					elapsedMinutesRef.current,
					0,
				);
			},
		});

	const toggleFolder = (id: string) => {
		setOpenFolders((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const selectedNote = allNotes.find((n) => n.id === selectedNoteId) ?? null;
	const hasMaterial = folders.length > 0 || looseNotes.length > 0;

	const handleAbandon = () => {
		startAbandonTransition(async () => {
			await abandonSessionAction(sessionId, elapsedMinutes, 0);
			router.push("/solarium");
		});
	};

	const handleExit = () => {
		router.push("/solarium");
	};

	const handleOpenCloseDay = () => {
		setCompletionOpen(true);
	};

	const handleConfirmCloseDay = (reflection: string | null) => {
		startCompleteTransition(async () => {
			await completeSessionAction(
				sessionId,
				elapsedMinutes,
				0,
				reflection,
			);
			router.push("/solarium");
		});
	};

	return (
		<div className="flex h-screen flex-col bg-background">
			<ActiveTopbar
				title={title}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				onAbandon={handleAbandon}
				abandonPending={isAbandoning}
				elapsedMinutes={elapsedMinutes}
				isCompleted={isCompleted}
				onExit={handleExit}
				inExtraTime={inExtraTime}
				onCloseDay={handleOpenCloseDay}
			/>

			<main className="flex flex-1 overflow-hidden">
				{activeTab === "notas" && (
					<>
						<MaterialSidebar
							folders={folders}
							looseNotes={looseNotes}
							hasMaterial={hasMaterial}
							selectedNoteId={selectedNoteId}
							onSelectNote={setSelectedNoteId}
							openFolders={openFolders}
							onToggleFolder={toggleFolder}
						/>
						<ActiveNoteEditor selectedNote={selectedNote} />
					</>
				)}
				{activeTab === "tareas" && <ComingSoon icon={ListTodo} title="Tareas" />}
				{activeTab === "tablero" && (
					<ComingSoon icon={LayoutGrid} title="Tablero" />
				)}
			</main>

			<FloatingTimer
				expanded={timerExpanded}
				onToggle={() => setTimerExpanded((e) => !e)}
				timerDisplay={timerDisplay}
				targetMinutes={targetMinutes}
				elapsedDisplay={elapsedDisplay}
				progress={progress}
				isCompleted={isCompleted}
				inExtraTime={inExtraTime}
			/>
			<AbandonModal
				open={pendingHref !== null}
				pending={isConfirming}
				elapsedMinutes={elapsedMinutes}
				onCancel={cancelExit}
				onConfirm={confirmExit}
			/>
			<CompletionModal
				open={completionOpen}
				onOpenChange={setCompletionOpen}
				targetMinutes={targetMinutes}
				extraMinutes={extraMinutes}
				pending={isCompleting}
				onConfirm={handleConfirmCloseDay}
			/>
		</div>
	);
}
