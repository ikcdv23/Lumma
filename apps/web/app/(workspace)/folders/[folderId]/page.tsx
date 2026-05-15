import { notFound } from "next/navigation";
import { requireAuthedUserId } from "@/lib/auth-helper";
import * as folderService from "@/server/folder/folder.service";
import { NotesGrid } from "@/components/notes/notes-grid";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function FolderPage({
    params,
}: {
    params: Promise<{ folderId: string }>;
}) {
    const userId = await requireAuthedUserId();
    const { folderId } = await params;
    const folder = await folderService.getFolder(userId, folderId);

    if (!folder) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 w-full max-w-5xl mx-auto">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/folders">Carpetas</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <NotesGrid
                folderId={folder.id}
                folderName={folder.name}
                notes={folder.notes}
            />
        </div>
    );
}
