import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
	return (
		<section className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
			<div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
				<div className="flex flex-col gap-7">
					<div className="inline-flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
						<span className="size-1.5 rounded-full bg-primary" />
						En beta abierta
					</div>

					<h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
						Notas claras.
						<br />
						<span className="text-primary">Estudio enfocado.</span>
					</h1>

					<p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
						Lumma combina un editor rico para tus notas con Solarium, un
						modo de estudio sin distracciones donde tus minutos se ven como
						un sol que recorre el cielo.
					</p>

					<div className="flex flex-wrap gap-3">
						<Button asChild size="lg">
							<Link href="/register">
								Empezar gratis
								<ArrowRight className="size-4" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link href="/login">Ya tengo cuenta</Link>
						</Button>
					</div>

					<p className="text-xs text-muted-foreground">
						Sin tarjeta de crédito · Gratuito durante la beta
					</p>
				</div>

				<div className="relative">
					<div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
						<Image
							src="/img/home-page.png"
							alt="Pantalla principal de Lumma"
							width={1280}
							height={720}
							className="h-auto w-full"
							priority
						/>
					</div>
					<div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-primary/5 blur-2xl" />
				</div>
			</div>
		</section>
	);
}
