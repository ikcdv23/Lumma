import Link from "next/link";
import { ArrowLeft, FolderOpen, Clock, Sparkles } from "lucide-react";
import { FolderPickerButton } from "../_components/folder-picker-button";

export const metadata = { title: "Nueva sesión — Mockup" };

export default function NewSessionMockup() {
	return (
		<div className="flex h-full w-full flex-col">
			{/* Header */}
			<header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border/40 bg-background/80 px-4 py-2.5 backdrop-blur-md">
				<Link
					href="/sessions-mockup"
					className="-ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm hover:bg-muted transition-colors"
				>
					<ArrowLeft className="size-4" />
					Volver
				</Link>
			</header>

			<div className="flex flex-1 items-center justify-center p-6 md:p-12">
				<div className="flex w-full max-w-md flex-col gap-8">
					{/* Hero */}
					<div className="flex flex-col items-center gap-3 text-center">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
							<Sparkles className="size-7" />
						</div>
						<div className="flex flex-col gap-1">
							<h1 className="text-2xl font-bold tracking-tight">
								Sesión de estudio
							</h1>
							<p className="text-sm text-muted-foreground">
								Concéntrate en lo que importa
							</p>
						</div>
					</div>

					{/* Folder picker (con modal) */}
					<div className="flex flex-col gap-2">
						<label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							<FolderOpen className="size-3.5" />
							Qué vas a estudiar
						</label>
						<FolderPickerButton />
					</div>

					{/* Duration chips */}
					<div className="flex flex-col gap-2">
						<label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							<Clock className="size-3.5" />
							Cuánto tiempo
						</label>
						<div className="grid grid-cols-3 gap-2">
							{[25, 50, 90].map((min) => (
								<button
									key={min}
									type="button"
									className={`rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
										min === 25
											? "border-primary bg-primary/10 text-primary"
											: "bg-card hover:border-primary/40 hover:shadow-sm"
									}`}
								>
									{min} min
								</button>
							))}
						</div>
					</div>

					{/* Preview */}
					<p className="text-center text-xs text-muted-foreground leading-relaxed">
						Vas a estudiar{" "}
						<span className="font-medium text-foreground">Inbox</span> durante{" "}
						<span className="font-medium text-foreground">25 min</span>.<br />
						Acabarás aproximadamente a las{" "}
						<span className="font-medium text-foreground">16:42</span>.
					</p>

					{/* CTA */}
					<Link
						href="/sessions-mockup/regret"
						className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
					>
						Empezar
					</Link>
				</div>
			</div>
		</div>
	);
}
