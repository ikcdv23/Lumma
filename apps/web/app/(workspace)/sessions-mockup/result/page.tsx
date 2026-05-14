import Link from "next/link";
import { Sparkles, Cloud, Flame } from "lucide-react";
import { SaveAsTemplateButton } from "../_components/save-as-template-button";

type SearchParams = Promise<{ status?: string }>;

export const metadata = { title: "Resultado — Mockup" };

export default async function ResultMockup({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const { status } = await searchParams;
	const completed = status !== "failed";

	return (
		<div className="flex h-full w-full items-center justify-center p-6">
			<div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
				{/* Icon */}
				<div
					className={`flex size-20 items-center justify-center rounded-3xl ${
						completed
							? "bg-primary/10 text-primary"
							: "bg-muted text-muted-foreground"
					}`}
				>
					{completed ? (
						<Sparkles className="size-10" />
					) : (
						<Cloud className="size-10" />
					)}
				</div>

				{/* Title + meta */}
				<div className="flex flex-col gap-2">
					<h1 className="text-2xl font-bold tracking-tight">
						{completed ? "Sesión completada" : "Sesión incompleta"}
					</h1>
					<p className="text-sm text-muted-foreground">
						{completed ? "25 min · Inbox" : "12 / 25 min · Inbox"}
					</p>
				</div>

				{/* Stats only on completed */}
				{completed ? (
					<div className="w-full rounded-xl border bg-card p-5 text-left">
						<h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Lo que hiciste
						</h3>
						<ul className="flex flex-col gap-2 text-sm">
							<li className="flex items-center gap-3">
								<span className="size-1.5 rounded-full bg-primary" />
								<span>3 notas revisadas</span>
							</li>
							<li className="flex items-center gap-3">
								<span className="size-1.5 rounded-full bg-primary" />
								<span>1 nota nueva</span>
							</li>
							<li className="flex items-center gap-3">
								<Flame className="size-3.5 text-primary" />
								<span>
									Día <span className="font-semibold">7</span> de tu racha
								</span>
							</li>
						</ul>
					</div>
				) : (
					<p className="text-sm leading-relaxed text-muted-foreground">
						Te quedaste 13 min antes del final. Mañana lo intentas otra vez —
						esta no cuenta para tu racha.
					</p>
				)}

				{/* CTAs */}
				<div className="flex w-full gap-3">
					<Link
						href="/sessions-mockup/new"
						className="flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
					>
						Otra vez
					</Link>
					<Link
						href="/sessions-mockup"
						className="flex flex-1 items-center justify-center rounded-lg border bg-card px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted"
					>
						Volver
					</Link>
				</div>

				{/* Guardar como plantilla — solo en completed */}
				{completed && <SaveAsTemplateButton />}

				{/* dev nav */}
				<div className="flex gap-3 text-xs text-muted-foreground/50">
					<Link
						href="/sessions-mockup/result?status=completed"
						className="underline"
					>
						[ver completed]
					</Link>
					<Link
						href="/sessions-mockup/result?status=failed"
						className="underline"
					>
						[ver failed]
					</Link>
				</div>
			</div>
		</div>
	);
}
