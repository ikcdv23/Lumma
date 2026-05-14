"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, ListTodo } from "lucide-react";
import {
	abandonSessionAction,
	completeSessionAction,
	createNoteInActiveSessionAction,
	heartbeatAction,
} from "@/server/solarium/solarium.actions";
import { ActiveTopbar } from "./active-topbar";
import { ComingSoon } from "./coming-soon";
import { FloatingTimer } from "./floating-timer";
import { MaterialSidebar } from "./material-sidebar";
import { ActiveNoteEditor } from "./active-note-editor";

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
	const [isCreatingNote, startCreateNoteTransition] = useTransition();

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

	// Ref para que el auto-complete solo se dispare una vez aunque el render
	// vuelva a pasar con remainingSeconds === 0
	const completionFiredRef = useRef(false);

	// Tick del timer (1s)
	useEffect(() => {
		if (isCompleted) return;
		const id = setInterval(() => {
			setRemainingSeconds((s) => Math.max(0, s - 1));
		}, 1000);
		return () => clearInterval(id);
	}, [isCompleted]);

	// Heartbeat cada 45s para que el lazy cleanup no marque la sesión como
	// ABANDONED. Solo mientras siga ACTIVE (no completada ni abandonando).
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
	const progress = (elapsedSeconds / targetSeconds) * 100;

	// Auto-complete cuando el timer llega a 0
	useEffect(() => {
		if (remainingSeconds > 0) return;
		if (completionFiredRef.current) return;
		completionFiredRef.current = true;

		completeSessionAction(sessionId, targetMinutes, 0).then(() => {
			setIsCompleted(true);
		});
	}, [remainingSeconds, sessionId, targetMinutes]);

	// beforeunload: si el user cierra/refresca con la sesión todavía activa,
	// disparar un sendBeacon que marque como abandoned con los minutos hechos.
	// Si ya está completada, no hace falta.
	useEffect(() => {
		if (isCompleted) return;
		const handler = () => {
			const payload = JSON.stringify({
				sessionId,
				studyMinutes: elapsedMinutes,
			});
			navigator.sendBeacon(
				"/api/solarium/abandon",
				new Blob([payload], { type: "application/json" }),
			);
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [sessionId, elapsedMinutes, isCompleted]);

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

	const handleCreateNote = () => {
		startCreateNoteTransition(async () => {
			const created = await createNoteInActiveSessionAction();
			if (created) {
				setSelectedNoteId(created.id);
				router.refresh();
			}
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
							onCreateNote={handleCreateNote}
							creatingNote={isCreatingNote}
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
				elapsedMinutes={elapsedMinutes}
				progress={progress}
				isCompleted={isCompleted}
			/>
		</div>
	);
}
