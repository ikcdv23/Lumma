import { indexFolders } from "@/server/actions/folder-actions";
import { FoldersGrid } from "@/components/folders/folder-grid";

export const metadata = {
    title: "Carpetas",
};

export default async function FoldersPage() {
    const folders = (await indexFolders()) ?? [];

    return (
        <div className="flex flex-col gap-8 p-6 md:p-8 w-full max-w-6xl mx-auto mt-30">
            <FoldersGrid folders={folders} />
        </div>
    );
}
