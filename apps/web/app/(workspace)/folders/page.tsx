import { requireAuthedUserId } from "@/lib/auth-helper";
import * as folderService from "@/server/folder/folder.service";
import { FoldersGrid } from "@/components/folders/folder-grid";

export const metadata = {
    title: "Carpetas",
};

export default async function FoldersPage() {
    const userId = await requireAuthedUserId();
    const folders = await folderService.listFolders(userId);

    return (
        <div className="flex flex-col gap-8 p-6 md:p-8 w-full max-w-5xl mx-auto">
            <FoldersGrid folders={folders} />
        </div>
    );
}
