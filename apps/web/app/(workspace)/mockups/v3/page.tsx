import Link from "next/link";
import { FileText, Folder, Inbox, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockFolders, mockRecentNotes, mockUserName } from "../mock-data";

export const metadata = {
    title: "Mockup V3 - Quick capture",
};

export default function MockupV3() {
    return (
        <div className="flex flex-col gap-10 p-6 md:p-12 w-full max-w-4xl mx-auto">
            {/* Hero: Quick capture centrado */}
            <div className="flex flex-col items-center gap-6 pt-8">
                <div className="flex flex-col items-center gap-2 text-center">
                    <Sparkles className="size-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">
                        Hola, {mockUserName}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Que tienes en mente?
                    </p>
                </div>
                <div className="w-full max-w-2xl flex gap-2">
                    <Input
                        placeholder="Escribe una nota rapida..."
                        className="h-12 text-base flex-1"
                    />
                    <Button size="lg" className="h-12">
                        Anotar
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Las notas rapidas van a tu Inbox
                </p>
            </div>

            {/* Carpetas como chips horizontales */}
            <section className="flex flex-col gap-3">
                <h2 className="text-sm font-medium text-muted-foreground">
                    Tus carpetas
                </h2>
                <div className="flex flex-wrap gap-2">
                    {mockFolders.map((folder) => {
                        const Icon = folder.isDefault ? Inbox : Folder;
                        return (
                            <Link
                                key={folder.id}
                                href="#"
                                className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm transition-all hover:border-primary/40 hover:shadow-sm"
                            >
                                <Icon className="size-4 text-primary" />
                                <span className="font-medium">{folder.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {folder.noteCount}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Notas recientes como lista compacta */}
            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Recientes
                    </h2>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="#">Ver todas</Link>
                    </Button>
                </div>
                <div className="flex flex-col gap-1">
                    {mockRecentNotes.slice(0, 4).map((note) => (
                        <Link
                            key={note.id}
                            href="#"
                            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40"
                        >
                            <FileText className="size-4 text-muted-foreground shrink-0" />
                            <span className="flex-1 text-sm font-medium truncate">
                                {note.title}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                                {note.folder}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0 w-20 text-right">
                                {note.updatedAt}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
