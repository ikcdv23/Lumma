"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ListTodo } from "lucide-react";
import { toast } from "sonner";
import type { KanbanStatus } from "@/generated/prisma/client";
import {
	abandonSessionAction,
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
	const [completionModalOpen, setCompletionModalOpen] = useState(false);

	const completionFiredRef = useRef(false);

	// Abre el modal de fin la primera vez que isCompleted pasa a true. Si el
	// user lo cierra con "Quedarme un poco más" no vuelve a aparecer solo —
	// puede seguir trabajando en /active aunque la sesión está cerrada en BD.
	const completionModalShownRef = useRef(false);
	useEffect(() => {
		if (isCompleted && !completionModalShownRef.current) {
			completionModalShownRef.current = true;
			setCompletionModalOpen(true);
		}
	}, [isCompleted]);

	// Conteo de tareas hechas/total para el resumen. El kanban tiene su propio
	// state local en KanbanBoard, así que aquí mostramos el snapshot inicial
	// (fiable si el user no ha tocado el tablero en esta vista de active).
	// Para una versión más fiable habría que subir el state del kanban — out
	// of scope ahora.
	const kanbanDoneCount = kanbanCards.filter((c) => c.status === "DONE").length;

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

		// Abrimos el modal inmediatamente y disparamos el save en paralelo.
		// Usamos fetch a una API route (no Server Action) porque los Server
		// Actions re-renderizan la page actual, lo que hace que /active
		// detecte "ya no hay sesión activa" y redirija a /solarium ANTES
		// de que el user vea el modal de cierre.
		setIsCompleted(true);
		setCompletionModalOpen(true);
		completionModalShownRef.current = true;

		fetch("/api/solarium/complete", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				sessionId,
				studyMinutes: targetMinutes,
				breakMinutes: 0,
			}),
		}).catch((err) => {
			console.error("complete session failed", err);
			toast.error("No se pudo guardar el cierre de la sesión", {
				description: "Vuelve a intentarlo desde el botón Salir.",
			});
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

			<CompletionModal
				open={completionModalOpen}
				onOpenChange={setCompletionModalOpen}
				targetMinutes={targetMinutes}
				elapsedMinutes={elapsedMinutes || targetMinutes}
				foldersCount={folders.length}
				notesCount={allNotes.length}
				kanbanDone={kanbanDoneCount}
				kanbanTotal={kanbanCards.length}
				onExit={handleExit}
				onStayLonger={() => setCompletionModalOpen(false)}
			/>
		</div>
	);
}
