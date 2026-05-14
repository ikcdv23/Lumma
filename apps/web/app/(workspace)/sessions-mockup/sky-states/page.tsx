import { SkyToday } from "@/components/solarium/sky/sky-today";

export const metadata = { title: "Cielo — estados — Mockup" };

const STREAK = 7;
const TARGET = 90;

const states = [
	{ minutes: 0, label: "Sin actividad", description: "Predawn / madrugada" },
	{ minutes: 15, label: "Empezando", description: "Amanece" },
	{ minutes: 50, label: "Media mañana", description: "Sol subiendo" },
	{ minutes: 95, label: "Cielo pleno", description: "Mediodía" },
];

export default function SkyStatesMockup() {
	return (
		<div className="flex flex-col gap-8 p-6 md:p-12 w-full max-w-5xl mx-auto mt-10">
			<div className="flex flex-col gap-1">
				<h1 className="text-3xl font-bold tracking-tight">
					Cielo del día — estados según actividad
				</h1>
				<p className="text-sm text-muted-foreground">
					Izquierda: detalle completo. Derecha: low detail (sin halos, sin
					nubes extra, sin estrellas extra, sin shadows del sol).
				</p>
			</div>

			{states.map((state) => (
				<section key={state.minutes} className="flex flex-col gap-2">
					<div className="flex items-baseline justify-between">
						<h2 className="text-base font-semibold">
							{state.minutes} min · {state.label}
						</h2>
						<span className="text-xs text-muted-foreground">
							{state.description}
						</span>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
						<SkyToday
							todayMinutes={state.minutes}
							target={TARGET}
							streak={STREAK}
						/>
						<SkyToday
							todayMinutes={state.minutes}
							target={TARGET}
							streak={STREAK}
							lowDetail
						/>
					</div>
				</section>
			))}
		</div>
	);
}
