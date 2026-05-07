import Link from "next/link";
import { Clock, Folder, FilePlus, FileText } from "lucide-react";
import { AbandonButton } from "../_components/abandon-button";

export const metadata = { title: "Sesión activa — Mockup" };

export default function ActiveSessionMockup() {
	const notes = [
		{ id: "1", title: "Tema 1: Introducción", active: true, done: false },
		{ id: "2", title: "Tema 2: Funciones", active: false, done: false },
		{ id: "3", title: "Tema 3: Derivadas", active: false, done: true },
		{ id: "4", title: "Resumen rápido", active: false, done: false },
	];

	return (
		<div className="flex h-full w-full flex-col">
			{/* Header con timer + folder + abandon */}
			<header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-background/95 px-4 py-2.5 backdrop-blur">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<Clock className="size-4 text-primary" />
						<span className="font-mono text-lg font-semibold tabular-nums">
							24:31
						</span>
					</div>
					<div className="hidden items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs md:flex">
						<Folder className="size-3.5 text-primary" />
						<span className="font-medium">Inbox</span>
					</div>
				</div>
				<AbandonButton minutesElapsed={12} target={25} />
			</header>

			{/* Body: split layout */}
			<div className="flex flex-1 overflow-hidden">
				{/* Sub-sidebar: notes list */}
				<aside className="hidden w-64 shrink-0 flex-col gap-1 border-r bg-muted/20 p-3 md:flex">
					<h3 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Notas de la carpeta
					</h3>
					{notes.map((n) => (
						<button
							key={n.id}
							type="button"
							className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
								n.active
									? "bg-primary/10 font-medium text-primary"
									: "hover:bg-muted"
							}`}
						>
							<FileText className="size-3.5 shrink-0 opacity-60" />
							<span className="flex-1 truncate">{n.title}</span>
							{n.done && <span className="text-xs opacity-60">✓</span>}
						</button>
					))}
					<button
						type="button"
						className="mt-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						<FilePlus className="size-3.5" />
						Nueva nota
					</button>
				</aside>

				{/* Main: note editor mock */}
				<main className="flex-1 overflow-auto">
					<div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-10 md:py-16">
						<h1 className="text-4xl font-bold tracking-tight md:text-5xl">
							Tema 1: Introducción
						</h1>
						<div className="mt-8 flex flex-col gap-4 text-base leading-relaxed text-muted-foreground">
							<p>
								Aquí iría el contenido de la nota — el editor BlockNote completo.
							</p>
							<p>
								El usuario puede leer, editar, marcar como aprendida, etc.
							</p>
							<p>Al cambiar de nota desde el sub-sidebar, el timer del header se mantiene.</p>
							<p>
								La sidebar global (Inicio, Inbox, Carpetas) está oculta durante la sesión
								para reducir distracciones — en este mockup la verás porque hereda
								del layout, pero la idea es esconderla.
							</p>
						</div>
					</div>
				</main>
			</div>

			{/* dev nav */}
			<div className="border-t bg-muted/20 p-2 text-center">
				<Link
					href="/sessions-mockup/result?status=completed"
					className="text-xs text-muted-foreground/50 underline"
				>
					[dev → saltar a completada]
				</Link>
			</div>
		</div>
	);
}
