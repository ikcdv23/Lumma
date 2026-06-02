import Link from "next/link";

export const metadata = {
	title: "Página no encontrada",
};

export default function NotFound() {
	return (
		<div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
			<div className="flex flex-col gap-2">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
					Error 404
				</p>
				<h1 className="text-3xl font-bold tracking-tight md:text-4xl">
					Esto no está donde buscas
				</h1>
				<p className="max-w-md text-sm text-muted-foreground">
					La página no existe o se movió. Si llegaste aquí desde un enlace de
					Lumma, dínoslo en Feedback.
				</p>
			</div>
			<div className="flex flex-wrap items-center justify-center gap-3">
				<Link
					href="/home"
					className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					Volver al inicio
				</Link>
				<Link
					href="/feedback"
					className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
				>
					Reportar el problema
				</Link>
			</div>
		</div>
	);
}
