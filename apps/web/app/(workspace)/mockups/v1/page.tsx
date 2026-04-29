import Link from "next/link";
import { FileText, Folder, FolderHeart, Inbox, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockFolders, mockRecentNotes, mockUserName } from "../../home/mock-data";

export const metadata = {
    title: "Mockup V1 - Dashboard",
};

export default function MockupV1() {
    return (
        <div className="flex flex-col gap-8 p-6 md:p-8 w-full max-w-6xl mx-auto">
            {/* Saludo */}
            <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">Buenos dias</p>
                <h1 className="text-3xl font-bold tracking-tight">
                    Hola, {mockUserName}
                </h1>
            </div>

            {/* Quick capture */}
            <div className="flex flex-col gap-2 rounded-xl border bg-card p-5">
                <label htmlFor="quick" className="text-sm font-medium">
                    Anota algo rapido
                </label>
                <div className="flex gap-2">
                    <Input
                        id="quick"
                        placeholder="Que quieres apuntar?"
                        className="flex-1"
                    />
                    <Button>
                        <Plus className="size-4" />
                        Crear
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Ira a tu Inbox. Luego podras moverla a una carpeta.
                </p>
            </div>

            {/* Notas recientes */}
            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Notas recientes</h2>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="#">Ver todas</Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {mockRecentNotes.slice(0, 3).map((note) => (
                        <Link
                            key={note.id}
                            href="#"
                            className="group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                        >
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <FileText className="size-4" />
                            </div>
                            <div className="flex flex-col gap-1 min-w-0">
                                <h3 className="font-medium truncate">{note.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {note.preview}
                                </p>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                <span className="flex items-center gap-1">
                                    <Folder className="size-3" />
                                    {note.folder}
                                </span>
                                <span>{note.updatedAt}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Carpetas */}
            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Tus carpetas</h2>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/folders">Ver todas</Link>
                    </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {mockFolders.map((folder) => {
                        const Icon = folder.isDefault ? Inbox : Folder;
                        return (
                            <Link
                                key={folder.id}
                                href="#"
                                className="group flex flex-col gap-2 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                            >
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Icon className="size-4" />
                                </div>
                                <h3 className="font-medium truncate">{folder.name}</h3>
                                <span className="text-xs text-muted-foreground">
                                    {folder.noteCount} notas
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
