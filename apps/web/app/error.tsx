"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// En producción esto debería enviarse a Sentry / equivalente. De momento
		// queda en consola del servidor para que aparezca en los logs de Vercel.
		console.error("Unhandled route error", error);
	}, [error]);

	return (
		<div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
			<div className="flex flex-col gap-2">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
					Algo se rompió
				</p>
				<h1 className="text-3xl font-bold tracking-tight md:text-4xl">
					Esto no debería haber pasado
				</h1>
				<p className="max-w-md text-sm text-muted-foreground">
					Tuvimos un error procesando tu petición. Puedes reintentar o volver
					al inicio. Si pasa otra vez, dínoslo en Feedback.
				</p>
				{error.digest && (
					<p className="mt-2 font-mono text-[11px] text-muted-foreground/60">
						ID: {error.digest}
					</p>
				)}
			</div>
			<div className="flex flex-wrap items-center justify-center gap-3">
				<button
					type="button"
					onClick={reset}
					className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					Reintentar
				</button>
				<Link
					href="/home"
					className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
				>
					Volver al inicio
				</Link>
			</div>
		</div>
	);
}
