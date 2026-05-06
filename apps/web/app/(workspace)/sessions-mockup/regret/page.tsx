import Link from "next/link";

export const metadata = { title: "Empezando sesión — Mockup" };

export default function RegretMockup() {
	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-8 p-6">
			<p className="text-sm text-muted-foreground">Empezando sesión...</p>

			{/* Breathing dots */}
			<div className="flex gap-3">
				<span className="size-3 rounded-full bg-primary animate-pulse [animation-delay:0ms]" />
				<span className="size-3 rounded-full bg-primary animate-pulse [animation-delay:200ms]" />
				<span className="size-3 rounded-full bg-primary animate-pulse [animation-delay:400ms]" />
			</div>

			<div className="flex flex-col items-center gap-1">
				<p className="text-lg font-semibold">Estudiando Inbox</p>
				<p className="text-sm text-muted-foreground">
					25 min · acabas a las 16:42
				</p>
			</div>

			<p className="text-xs text-muted-foreground">
				Esta ventana se cerrará en{" "}
				<span className="font-medium tabular-nums">28s</span>
			</p>

			<Link
				href="/sessions-mockup"
				className="rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-all hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
			>
				Cancelar (sin penalty)
			</Link>

			<Link
				href="/sessions-mockup/active"
				className="text-xs text-muted-foreground/50 underline"
			>
				[dev → saltar a sesión activa]
			</Link>
		</div>
	);
}
