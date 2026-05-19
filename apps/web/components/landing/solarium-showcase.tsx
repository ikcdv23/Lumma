import Image from "next/image";
import { Check, Sun } from "lucide-react";

const benefits = [
	"Eliges qué carpetas y notas vas a usar antes de empezar",
	"Workspace sin distracciones: cero sidebar, cero notificaciones",
	"Timer flotante que se expande con un click, no rompe el foco",
	"Tu sol amanece, llega al mediodía y se pone según los minutos hechos",
];

export function SolariumShowcase() {
	return (
		<section className="relative overflow-hidden bg-gradient-to-b from-amber-50/40 via-amber-50/20 to-transparent py-24">
			<div className="mx-auto max-w-6xl px-6">
				<div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
					<div className="flex flex-col gap-6">
						<div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
							<Sun className="size-3.5" />
							Solarium
						</div>

						<h2 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
							Sesiones de estudio
							<br />
							<span className="text-amber-600">sin distracciones</span>
						</h2>

						<p className="text-lg leading-relaxed text-muted-foreground">
							Un modo dedicado donde el tiempo se siente, no se cuenta.
							Eliges tu material, fijas duración y entras en flow hasta
							que el sol se pone.
						</p>

						<ul className="flex flex-col gap-3">
							{benefits.map((benefit) => (
								<li
									key={benefit}
									className="flex items-start gap-3 text-sm leading-relaxed"
								>
									<div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
										<Check className="size-3" strokeWidth={2.5} />
									</div>
									<span>{benefit}</span>
								</li>
							))}
						</ul>
					</div>

					<div className="relative">
						<div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
							<Image
								src="/img/solarium-02.png"
								alt="Workspace activo en Solarium"
								width={1280}
								height={720}
								className="h-auto w-full"
							/>
						</div>
						<div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-amber-200/30 blur-2xl" />
					</div>
				</div>
			</div>
		</section>
	);
}
