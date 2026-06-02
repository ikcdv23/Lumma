"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ListTodo } from "lucide-react";
import type { KanbanStatus } from "@/generated/prisma/client";
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
import { KanbanBoard } from "./kanban-board";

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

type KanbanCardSeed = {
	id: string;
	title: string;
	status: KanbanStatus;
	createdAt: Date;
	updatedAt: Date;
};

type Props = {
	sessionId: string;
	title: string;
	targetMinutes: number;
	initialRemainingSeconds: number;
	folders: FolderMaterial[];
	looseNotes: LooseNote[];
	kanbanCards: KanbanCardSeed[];
};

const HEARTBEAT_INTERVAL_MS = 45_000;

export function ActiveSession({
	sessionId,
	title,
	targetMinutes,
	initialRemainingSeconds,
	folders,
	looseNotes,
	kanbanCards,
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

	const completionFiredRef = useRef(false);

	useEffect(() => {
		if (isCompleted) return;
		const id = setInterval(() => {
			setRemainingSeconds((s) => Math.max(0, s - 1));
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

	const minutes = Math.floor(remainingSeconds / 60);
	const seconds = remainingSeconds % 60;
	const timerDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

	const targetSeconds = targetMinutes * 60;
	const elapsedSeconds = targetSeconds - remainingSeconds;
	const elapsedMinutes = Math.floor(elapsedSeconds / 60);
	const elapsedDisplay = `${String(elapsedMinutes).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;
	const progress = (elapsedSeconds / targetSeconds) * 100;

	useEffect(() => {
		if (remainingSeconds > 0) return;
		if (completionFiredRef.current) return;
		completionFiredRef.current = true;

		completeSessionAction(sessionId, targetMinutes, 0).then(() => {
			setIsCompleted(true);
		});
	}, [remainingSeconds, sessionId, targetMinutes]);

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
					<KanbanBoard sessionId={sessionId} initialCards={kanbanCards} />
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
			/>
			<AbandonModal
				open={pendingHref !== null}
				pending={isConfirming}
				elapsedMinutes={elapsedMinutes}
				onCancel={cancelExit}
				onConfirm={confirmExit}
			/>

			{/* Dev-only: salta al estado completado sin esperar al timer. El bloque
			    entero es eliminado por el compilador en producción porque
			    NODE_ENV se sustituye en build time y el `if` queda en `false`. */}
			{process.env.NODE_ENV === "development" && !isCompleted && (
				<div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-50/90 px-3 py-2 text-xs font-mono shadow-sm backdrop-blur">
					<span className="text-amber-700">🐛 dev</span>
					<button
						type="button"
						onClick={() => setRemainingSeconds(0)}
						className="rounded-md bg-amber-500 px-2 py-1 text-white transition-colors hover:bg-amber-600"
					>
						Saltar al final
					</button>
				</div>
			)}
		</div>
	);
}
