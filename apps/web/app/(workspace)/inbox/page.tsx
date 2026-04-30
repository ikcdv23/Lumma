import Link from "next/link";
import { FileText, Inbox } from "lucide-react";
import { getInboxNotes } from "@/server/actions/notes-actions";

export const metadata = {
    title: "Inbox",
};

export default async function InboxPage() {
    const notes = await getInboxNotes();
    const isEmpty = notes.length === 0;

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 w-full max-w-4xl mx-auto">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Inbox className="size-7 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                    {isEmpty
                        ? "No tienes notas rapidas pendientes"
                        : `${notes.length} ${notes.length === 1 ? "nota rapida" : "notas rapidas"}`}
                </p>
            </div>

            {isEmpty ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 px-6 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Inbox className="size-8" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-semibold">Tu Inbox esta vacio</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Las notas rapidas que crees apareceran aqui hasta que las muevas a una carpeta
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    {notes.map((note) => (
                        <Link
                            key={note.id}
                            href={`/inbox/${note.id}`}
                            className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-all hover:border-primary/40 hover:shadow-sm"
                        >
                            <FileText className="size-4 text-muted-foreground shrink-0" />
                            <span className="flex-1 text-sm font-medium truncate">
                                {note.title || "Sin titulo"}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                                {new Intl.DateTimeFormat("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                }).format(note.updatedAt)}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
