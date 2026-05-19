import Image from "next/image";

export function SunSpotlight() {
	return (
		<section className="mx-auto max-w-5xl px-6 py-24">
			<div className="mx-auto mb-12 max-w-2xl text-center">
				<h2 className="text-3xl font-bold tracking-tight md:text-4xl">
					Tu tiempo, visible como un cielo
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Cada día tu sol arranca al amanecer y avanza con los minutos que
					estudias. Ni números fríos ni gráficos: una metáfora natural que
					hace tangible tu esfuerzo.
				</p>
			</div>

			<div className="relative">
				<div className="overflow-hidden rounded-3xl border bg-card shadow-2xl">
					<Image
						src="/img/solarium-01.png"
						alt="Vista de Solarium con el sol en amanecer"
						width={1600}
						height={1000}
						className="h-auto w-full"
					/>
				</div>

				{/* Glow envolvente — sutil, sólo en esta sección sí va amber */}
				<div className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-br from-amber-200/40 via-orange-200/30 to-rose-200/20 blur-3xl" />
			</div>
		</section>
	);
}
