import Link from "next/link";
import { FileText, Folder, Inbox, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockFolders, mockRecentNotes, mockUserName } from "../../home/mock-data";

export const metadata = {
    title: "Mockup V2 - Compacto",
};

export default function MockupV2() {
    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 w-full max-w-6xl mx-auto">
            {/* Saludo + Buscador */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Hola, {mockUserName}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Tienes {mockRecentNotes.length} notas activas
                    </p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar notas..."
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna izquierda: Lista de notas recientes */}
                <div className="lg:col-span-2 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Notas recientes</h2>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="#">Ver todas</Link>
                        </Button>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl border bg-card divide-y">
                        {mockRecentNotes.map((note) => (
                            <Link
                                key={note.id}
                                href="#"
                                className="group flex items-start gap-4 p-4 transition-colors hover:bg-muted/40 first:rounded-t-xl last:rounded-b-xl"
                            >
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                    <FileText className="size-4" />
                                </div>
                                <div className="flex flex-col gap-1 min-w-0 flex-1">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <h3 className="font-medium truncate">
                                            {note.title}
                                        </h3>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {note.updatedAt}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {note.preview}
                                    </p>
                                    <span className="text-xs text-muted-foreground/80 flex items-center gap-1">
                                        <Folder className="size-3" />
                                        {note.folder}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Columna derecha: Quick capture + carpetas */}
                <div className="flex flex-col gap-6">
                    {/* Quick capture */}
                    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
                        <h2 className="text-sm font-semibold">Captura rapida</h2>
                        <Input placeholder="Que quieres apuntar?" />
                        <Button className="w-full">
                            <Plus className="size-4" />
                            Crear nota
                        </Button>
                    </div>

                    {/* Carpetas */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Carpetas</h2>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/folders">Todas</Link>
                            </Button>
                        </div>
                        <div className="flex flex-col gap-1 rounded-xl border bg-card p-2">
                            {mockFolders.map((folder) => {
                                const Icon = folder.isDefault ? Inbox : Folder;
                                return (
                                    <Link
                                        key={folder.id}
                                        href="#"
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted"
                                    >
                                        <Icon className="size-4 text-primary" />
                                        <span className="flex-1 text-sm font-medium truncate">
                                            {folder.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {folder.noteCount}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
