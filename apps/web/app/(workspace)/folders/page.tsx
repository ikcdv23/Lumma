// app/(workspace)/folders/page.tsx
import { indexFolders } from "@/server/actions/folder-actions";
import { FoldersGrid } from "@/components/folders/folder-grid";

export default async function FoldersPage() {
    const folders = (await indexFolders()) ?? [];

    return (
        <div className="flex flex-col gap-6 p-6 w-full max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold">Mis carpetas</h1>
                <p className="text-sm text-muted-foreground">{folders.length} carpetas</p>
            </div>
            <FoldersGrid folders={folders} />
        </div>
    );
}