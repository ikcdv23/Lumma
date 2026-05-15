import Link from "next/link";
import { ArrowLeft, Sun } from "lucide-react";
import { requireAuthedUserId } from "@/lib/auth-helper";
import * as folderService from "@/server/folder/folder.service";
import * as noteService from "@/server/note/note.service";
import { SessionConfig } from "@/components/solarium/session-config";

export const metadata = {
	title: "Nueva sesión · Solarium",
};

export default async function NewSessionPage() {
	const userId = await requireAuthedUserId();

	const [folders, inboxNotes] = await Promise.all([
		folderService.listFoldersWithNotes(userId),
		noteService.getInboxNotes(userId),
	]);

	// SessionConfig solo necesita id+title para las notas sueltas
	const notes = inboxNotes.map((n) => ({ id: n.id, title: n.title }));

	return (
		<div className="flex flex-col gap-8 p-6 md:p-8 w-full max-w-5xl mx-auto">
			{/* Back link */}
			<Link
				href="/solarium"
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
			>
				<ArrowLeft className="size-4" />
				Volver a Solarium
			</Link>

			{/* Header */}
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					<Sun className="size-7 text-amber-500" />
					<h1 className="text-3xl font-bold tracking-tight">
						Configura tu sesión
					</h1>
				</div>
				<p className="text-sm text-muted-foreground">
					Elige tu material y duración. Cuando empieces, te quedarás concentrado
					hasta el final.
				</p>
			</div>

			<SessionConfig folders={folders} notes={notes} />
		</div>
	);
}
