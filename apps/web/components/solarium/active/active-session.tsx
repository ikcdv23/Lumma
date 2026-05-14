"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, ListTodo } from "lucide-react";
import {
	abandonSessionAction,
	createNoteInActiveSessionAction,
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

	useEffect(() => {
		const id = setInterval(() => {
			setRemainingSeconds((s) => Math.max(0, s - 1));
		}, 1000);
		return () => clearInterval(id);
	}, []);

	const minutes = Math.floor(remainingSeconds / 60);
	const seconds = remainingSeconds % 60;
	const timerDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

	const targetSeconds = targetMinutes * 60;
	const elapsedSeconds = targetSeconds - remainingSeconds;
	const elapsedMinutes = Math.floor(elapsedSeconds / 60);
	const progress = (elapsedSeconds / targetSeconds) * 100;

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
			/>
		</div>
	);
}
