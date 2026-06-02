import { redirect } from "next/navigation";
import { requireAuthedUserId } from "@/lib/auth-helper";
import * as solariumService from "@/server/solarium/solarium.service";
import * as kanbanService from "@/server/kanban/kanban.service";
import { ActiveSession } from "@/components/solarium/active/active-session";



export const metadata = {
	title: "Sesión activa · Solarium",
};

export default async function ActiveSessionPage() {
	const userId = await requireAuthedUserId();

	const material = await solariumService.getMaterialByUser(userId);
	if (!material) redirect("/solarium");

	// Las cards viven a nivel sesión: vacío al empezar una nueva sesión, lleno
	// si volvemos a la activa después de un refresh.
	const kanbanCards = await kanbanService.listCardsBySession(material.id, userId);

	// Resolver folders + notas sueltas a partir del material de la sesión
	const sessionNoteIds = new Set(material.notes.map((n) => n.id));

	const folders = material.folder.map((f) => ({
		id: f.id,
		name: f.name,
		notes: f.notes
			.filter((n) => sessionNoteIds.has(n.id))
			.map((n) => ({ id: n.id, title: n.title, content: n.content })),
	}));

	const folderNoteIds = new Set(
		material.folder.flatMap((f) => f.notes.map((n) => n.id)),
	);
	const looseNotes = material.notes.filter((n) => !folderNoteIds.has(n.id));

	// Timer: calcular segundos restantes a partir del startedAt para que el
	// timer "resuma" tras un refresh (no se reinicia).
	const elapsedSeconds = Math.floor(
		(Date.now() - material.startedAt.getTime()) / 1000,
	);
	const targetSeconds = material.targetMinutes * 60;
	const initialRemainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);

	return (
		<ActiveSession
			sessionId={material.id}
			title={material.title}
			targetMinutes={material.targetMinutes}
			initialRemainingSeconds={initialRemainingSeconds}
			folders={folders}
			looseNotes={looseNotes}
			kanbanCards={kanbanCards}
		/>
	);
}
