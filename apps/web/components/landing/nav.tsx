import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingNav() {
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
				<Link href="/" className="flex items-center gap-2.5">
					<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Sparkles className="size-4.5" fill="currentColor" strokeWidth={2} />
					</div>
					<span className="text-lg font-bold tracking-tight">Lumma</span>
				</Link>

				<nav className="flex items-center gap-2">
					<Button asChild variant="ghost" size="sm">
						<Link href="/login">Iniciar sesión</Link>
					</Button>
					<Button asChild size="sm">
						<Link href="/register">Empezar gratis</Link>
					</Button>
				</nav>
			</div>
		</header>
	);
}
