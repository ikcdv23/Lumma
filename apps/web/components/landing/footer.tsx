import Link from "next/link";
import { Sparkles } from "lucide-react";

export function LandingFooter() {
	return (
		<footer className="border-t bg-card/30">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
				<div className="flex items-center gap-2.5">
					<div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
						<Sparkles className="size-3.5" fill="currentColor" strokeWidth={2} />
					</div>
					<span className="text-sm font-semibold tracking-tight">Lumma</span>
					<span className="text-xs text-muted-foreground">
						© {new Date().getFullYear()}
					</span>
				</div>

				<nav className="flex items-center gap-5 text-xs text-muted-foreground">
					<Link href="/login" className="transition-colors hover:text-foreground">
						Iniciar sesión
					</Link>
					<Link
						href="/register"
						className="transition-colors hover:text-foreground"
					>
						Registrarse
					</Link>
				</nav>
			</div>
		</footer>
	);
}
