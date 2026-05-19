import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingCta() {
	return (
		<section className="mx-auto max-w-3xl px-6 py-24 text-center">
			<h2 className="text-3xl font-bold tracking-tight md:text-4xl">
				Empieza hoy. Es gratis.
			</h2>
			<p className="mx-auto mt-4 max-w-xl text-muted-foreground">
				Lumma está en beta abierta. Crea tu cuenta y empieza a estudiar con
				foco — sin coste, sin tarjeta, sin compromiso.
			</p>
			<Button asChild size="lg" className="mt-8">
				<Link href="/register">
					Crear cuenta gratis
					<ArrowRight className="size-4" />
				</Link>
			</Button>
		</section>
	);
}
