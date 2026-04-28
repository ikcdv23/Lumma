import { getFolder } from "@/server/actions/folder-actions";
import { notFound } from "next/navigation";
import { FilePlus, FileText, FolderPlus } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

export default async function FolderPage({
    params,
}: {
    params: Promise<{ folderId: string }>;
}) {
    const { folderId } = await params;
    const folder = await getFolder(folderId);

    if (!folder) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 w-full max-w-6xl mx-auto">
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

            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">{folder.name}</h1>
                <p className="text-sm text-muted-foreground">
                    {folder.notes.length} {folder.notes.length === 1 ? "nota" : "notas"}
                </p>
            </div>

            {folder.notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 px-6 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <FileText className="size-8" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-semibold">Esta carpeta esta vacia</h3>
                        <p className="text-sm text-muted-foreground">
                            Aun no has creado notas en esta carpeta
                        </p>
                        <Button variant="outline">
                            <FilePlus className="size-4" />
                            Crear mi primera nota
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-3">
                    {folder.notes.map((note) => (
                        <div key={note.id} className="rounded-lg border p-4">
                            <h3 className="font-medium">{note.title}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
