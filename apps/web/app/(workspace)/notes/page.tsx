import { auth } from "@/auth";
import { Folder, FolderPlus } from "lucide-react";
import { FolderCard } from "@/components/folders/folder-card";
import { indexFolders } from "@/server/actions/folder-actions";
import { CreateFolderModal } from "@/components/folders/create-folder-modal";

export default async function NotesPage() {
	const session = await auth(); // NOTA: Pendiente a revisar si se usa o no
	const folders = (await indexFolders()) ?? [];

	return (
		<div className="flex flex-col gap-6 p-6 w-full max-w-5xl mx-auto">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">
						<Folder />
						Mis carpetas
					</h1>
					<p className="text-sm text-muted-foreground">
						{folders.length} carpetas
					</p>
				</div>

				<CreateFolderModal />
			</div>

			{/* Grid de carpetas */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{folders.map((folder) => (
					<FolderCard
						key={folder.name}
						name={folder.name}
						noteCount={folder._count.notes}
					/>
				))}

				<div className="rounded-lg border border-dashed p-4 flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-all cursor-pointer">
					<FolderPlus className="size-5 mr-2" />
					<form action="">
						<span className="text-sm">Nueva carpeta</span>
					</form>
				</div>
			</div>
		</div>
	);
}
