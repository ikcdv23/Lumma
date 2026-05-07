import Link from "next/link";
import { ArrowLeft, Flame, Sun, CloudSun, Cloud, Moon } from "lucide-react";

export const metadata = { title: "Variantes — Mockup" };

// Mock data: minutos estudiados por día
const studyData: Record<number, number> = {
	1: 95, 2: 50, 3: 110, 5: 30, 6: 65,
	8: 80, 10: 25, 11: 110, 12: 95, 14: 60, 15: 30,
	18: 75, 19: 90, 20: 45, 21: 100, 22: 30,
	25: 95, 26: 110, 27: 80, 28: 60,
};
const TODAY = 7;
const TODAY_MINUTES = 50;
const TARGET = 90;
const STREAK = 7;

function getWeatherTone(minutes: number) {
	if (minutes >= 90) return { bg: "bg-amber-400", glow: "from-amber-300/40", text: "text-amber-700" };
	if (minutes >= 50) return { bg: "bg-amber-300", glow: "from-amber-200/30", text: "text-amber-600" };
	if (minutes >= 1) return { bg: "bg-amber-200", glow: "from-amber-100/20", text: "text-amber-500" };
	return { bg: "bg-muted", glow: "from-muted/0", text: "text-muted-foreground" };
}

export default function VariantsMockup() {
	return (
		<div className="flex flex-col gap-12 p-6 md:p-12 w-full max-w-5xl mx-auto mt-10">
			{/* Header */}
			<header className="flex flex-col gap-2">
				<Link
					href="/sessions-mockup"
					className="-ml-2 inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-sm hover:bg-muted transition-colors"
				>
					<ArrowLeft className="size-4" />
					Volver al hub
				</Link>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">3 propuestas para el módulo de actividad</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Mismo dato base (50min hoy · racha 7 · target 90min) en 3 lenguajes visuales distintos. Elige el que más te llame.
					</p>
				</div>
			</header>

			{/* PROPUESTA A — Cielo del día */}
			<Variant
				letter="A"
				title="Cielo del día"
				subtitle="El sol de Lumma sube según estudias. Inmersivo, hero del día."
				strengths={["Visceral · viste un cielo cambiando", "Coherente con Luminita (el sol literal)", "Hace de la app un objeto bonito de mirar"]}
				weaknesses={["Información histórica casi nula (solo hoy)", "Muy hero, no informativo"]}
			>
				<SkyTodayCard />
			</Variant>

			{/* PROPUESTA B — Horizonte mensual */}
			<Variant
				letter="B"
				title="Horizonte mensual"
				subtitle="Bar chart de los últimos 30 días con clima codificado en color y altura. Data-rich, ritmo visual."
				strengths={["Información densa y útil de un vistazo", "Patrones (vacaciones, tirones) saltan visualmente", "Streak integrado, no apartado"]}
				weaknesses={["Menos emocional que un cielo animado", "Ritmo de bar chart genérico si no se cuida"]}
			>
				<HorizonStripCard />
			</Variant>

			{/* PROPUESTA C — Constelación semanal */}
			<Variant
				letter="C"
				title="Constelación semanal"
				subtitle="Tu semana como 7 soles flotando, varían tamaño y brillo según el día. Original, brand-forward."
				strengths={["Único en el mercado · nadie hace esto", "Cada día es un objeto, no un número", "Funciona en mobile sin recortar"]}
				weaknesses={["Tope de información: solo 7 días", "Riesgo de ser cute si no se cuida"]}
			>
				<ConstellationCard />
			</Variant>

			{/* Decisión */}
			<section className="rounded-xl border border-dashed bg-muted/20 p-5">
				<h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
					Cómo decido yo
				</h3>
				<p className="text-sm text-muted-foreground leading-relaxed">
					Si Lumma quiere ser <span className="text-foreground font-medium">memorable / brand-led</span> → A o C. <br />
					Si Lumma quiere ser <span className="text-foreground font-medium">útil / dashboard-led</span> → B. <br />
					Una mezcla razonable: <span className="text-foreground font-medium">C como hero del hub</span> + <span className="text-foreground font-medium">B en una vista de stats</span> al hacer click.
				</p>
			</section>
		</div>
	);
}

// ─────────────────────────────────────────────────────
// Wrapper para etiquetar cada variante
// ─────────────────────────────────────────────────────
function Variant({
	letter,
	title,
	subtitle,
	strengths,
	weaknesses,
	children,
}: {
	letter: string;
	title: string;
	subtitle: string;
	strengths: string[];
	weaknesses: string[];
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col gap-4">
			<div className="flex items-baseline gap-3">
				<span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
					{letter}
				</span>
				<div>
					<h2 className="text-xl font-bold tracking-tight">{title}</h2>
					<p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
				</div>
			</div>
			{children}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
				<ul className="rounded-lg bg-muted/30 p-3 space-y-1">
					{strengths.map((s, i) => (
						<li key={i} className="flex gap-2">
							<span className="text-emerald-600">✓</span>
							<span className="text-muted-foreground">{s}</span>
						</li>
					))}
				</ul>
				<ul className="rounded-lg bg-muted/30 p-3 space-y-1">
					{weaknesses.map((w, i) => (
						<li key={i} className="flex gap-2">
							<span className="text-muted-foreground/60">−</span>
							<span className="text-muted-foreground">{w}</span>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}

// ─────────────────────────────────────────────────────
// PROPUESTA A — Cielo del día
// ─────────────────────────────────────────────────────
function SkyTodayCard() {
	const progressPct = Math.min((TODAY_MINUTES / TARGET) * 100, 100);
	// Sun rises from bottom (5%) to top-center (75%) as progress goes 0 → 100
	const sunBottom = 8 + (progressPct * 0.6);

	return (
		<div className="relative h-80 overflow-hidden rounded-2xl border bg-card">
			{/* Sky gradient — varía según progreso */}
			<div
				className="absolute inset-0"
				style={{
					background: `linear-gradient(to bottom,
						rgb(186 230 253 / 0.7) 0%,
						rgb(254 240 138 / 0.5) 60%,
						rgb(255 237 213 / 0.3) 100%)`,
				}}
			/>

			{/* Glow / halo del sol */}
			<div
				className="absolute size-48 rounded-full bg-amber-300/30 blur-3xl transition-all duration-1000"
				style={{
					left: "50%",
					bottom: `${sunBottom - 10}%`,
					transform: "translateX(-50%)",
				}}
			/>

			{/* Sol con gradiente */}
			<div
				className="absolute size-16 rounded-full shadow-2xl shadow-amber-400/40 transition-all duration-1000"
				style={{
					left: "50%",
					bottom: `${sunBottom}%`,
					transform: "translateX(-50%)",
					background: "radial-gradient(circle at 35% 35%, rgb(254 240 138), rgb(251 191 36))",
				}}
			/>

			{/* Nubes decorativas */}
			<Cloud
				className="absolute top-8 left-12 size-14 fill-white/70 stroke-white/0"
				strokeWidth={0}
			/>
			<Cloud
				className="absolute top-16 right-16 size-10 fill-white/60 stroke-white/0"
				strokeWidth={0}
			/>
			<Cloud
				className="absolute top-4 right-32 size-6 fill-white/50 stroke-white/0"
				strokeWidth={0}
			/>

			{/* Línea del horizonte */}
			<div className="absolute bottom-24 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-300/50 to-transparent" />

			{/* Footer con stats */}
			<div className="absolute inset-x-0 bottom-0 p-5 bg-linear-to-t from-card via-card/90 to-transparent backdrop-blur-[2px]">
				<div className="flex items-end justify-between gap-4">
					<div>
						<div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
							Hoy
						</div>
						<div className="flex items-baseline gap-2 mt-0.5">
							<span className="text-4xl font-bold tabular-nums">{TODAY_MINUTES}</span>
							<span className="text-sm text-muted-foreground mb-0.5">min</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Tu sol está al <span className="font-medium text-amber-600">{Math.round(progressPct)}%</span>. Faltan <span className="font-medium text-foreground">{TARGET - TODAY_MINUTES} min</span> para el mediodía.
						</p>
					</div>
					<div className="flex items-center gap-2 rounded-full bg-amber-100/70 px-3 py-1.5 ring-1 ring-amber-300/40">
						<Flame className="size-3.5 text-amber-600" />
						<span className="text-sm font-semibold tabular-nums text-amber-900">{STREAK}</span>
						<span className="text-xs text-amber-700/80">días al sol</span>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────
// PROPUESTA B — Horizonte mensual
// ─────────────────────────────────────────────────────
function HorizonStripCard() {
	const days = Array.from({ length: 30 }, (_, i) => i + 1);
	const monthTotal = Object.values(studyData).reduce((a, b) => a + b, 0) + TODAY_MINUTES;

	return (
		<div className="relative overflow-hidden rounded-2xl border bg-card p-6">
			{/* Header del card */}
			<div className="flex items-start justify-between gap-4 mb-6">
				<div>
					<div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
						Últimos 30 días
					</div>
					<div className="flex items-baseline gap-2 mt-1">
						<span className="text-3xl font-bold tabular-nums">{(monthTotal / 60).toFixed(1)}</span>
						<span className="text-sm text-muted-foreground">horas estudiadas</span>
					</div>
				</div>
				<div className="flex items-center gap-2 rounded-full bg-amber-100/70 px-3 py-1.5 ring-1 ring-amber-300/40">
					<Flame className="size-3.5 text-amber-600" />
					<span className="text-sm font-semibold tabular-nums text-amber-900">{STREAK}</span>
					<span className="text-xs text-amber-700/80">días</span>
				</div>
			</div>

			{/* Bar chart con baseline */}
			<div className="relative h-32 mb-2">
				{/* Gridline sutil al 50% (60 min mark) */}
				<div className="absolute inset-x-0 top-1/2 h-px bg-border/30" />
				{/* Baseline (suelo) */}
				<div className="absolute inset-x-0 bottom-0 h-px bg-border" />

				<div className="flex items-end gap-1 h-full">
					{days.map((day) => {
						const minutes = day === TODAY ? TODAY_MINUTES : (studyData[day] ?? 0);
						const heightPct = Math.max(4, Math.min((minutes / 120) * 100, 100));
						const isToday = day === TODAY;
						const tone = getWeatherTone(minutes);

						return (
							<div
								key={day}
								className={`relative flex-1 rounded-t-sm transition-all ${tone.bg} ${
									isToday ? "ring-2 ring-primary ring-offset-1 z-10" : ""
								} ${minutes === 0 ? "opacity-25" : "hover:opacity-80"}`}
								style={{ height: `${heightPct}%` }}
								title={
									minutes > 0
										? `Día ${day}: ${minutes} min`
										: `Día ${day}: sin estudio`
								}
							/>
						);
					})}
				</div>
			</div>

			{/* Eje temporal */}
			<div className="flex items-center justify-between text-[10px] text-muted-foreground">
				<span>hace 30 días</span>
				<span className="opacity-50">·</span>
				<span>hace 15 días</span>
				<span className="opacity-50">·</span>
				<span className="font-semibold text-primary">hoy ↑</span>
			</div>

			{/* Leyenda */}
			<div className="mt-4 flex items-center justify-center gap-4 pt-4 border-t border-border/40">
				<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<span className="size-3 rounded-sm bg-amber-200" /> 1-49m
				</span>
				<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<span className="size-3 rounded-sm bg-amber-300" /> 50-89m
				</span>
				<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<span className="size-3 rounded-sm bg-amber-400" /> 90+m
				</span>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────
// PROPUESTA C — Constelación semanal
// ─────────────────────────────────────────────────────
function ConstellationCard() {
	// 7 días: hoy + 6 anteriores
	const week = [
		{ label: "L", minutes: studyData[1] ?? 0 },
		{ label: "M", minutes: studyData[2] ?? 0 },
		{ label: "X", minutes: studyData[3] ?? 0 },
		{ label: "J", minutes: 0 }, // día 4
		{ label: "V", minutes: studyData[5] ?? 0 },
		{ label: "S", minutes: studyData[6] ?? 0 },
		{ label: "D", minutes: TODAY_MINUTES, isToday: true },
	];

	return (
		<div className="relative h-80 overflow-hidden rounded-2xl border bg-linear-to-b from-indigo-950 via-indigo-900 to-amber-200/40">
			{/* Estrellas decorativas de fondo */}
			<div className="absolute inset-0 opacity-50">
				<span className="absolute top-6 left-12 size-1 rounded-full bg-white" />
				<span className="absolute top-10 left-32 size-0.5 rounded-full bg-white/60" />
				<span className="absolute top-16 left-1/2 size-1 rounded-full bg-white/80" />
				<span className="absolute top-8 right-20 size-0.5 rounded-full bg-white/70" />
				<span className="absolute top-20 right-40 size-1 rounded-full bg-white/50" />
				<span className="absolute top-4 right-8 size-0.5 rounded-full bg-white/60" />
			</div>

			{/* Streak en esquina */}
			<div className="absolute top-5 right-5 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1.5 ring-1 ring-white/20">
				<Flame className="size-3.5 text-amber-300" />
				<span className="text-sm font-semibold tabular-nums text-white">{STREAK}</span>
				<span className="text-xs text-white/70">días</span>
			</div>

			{/* Header */}
			<div className="relative px-6 pt-6">
				<div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
					Tu semana
				</div>
				<div className="flex items-baseline gap-2 mt-1">
					<span className="text-3xl font-bold tabular-nums text-white">
						{week.reduce((acc, d) => acc + d.minutes, 0)}
					</span>
					<span className="text-sm text-white/60">min en 7 días</span>
				</div>
			</div>

			{/* 7 soles flotando */}
			<div className="absolute bottom-12 inset-x-0 flex items-end justify-around px-6">
				{week.map((day, i) => {
					const intensity = day.minutes;
					const size = intensity >= 90 ? 56 : intensity >= 50 ? 44 : intensity >= 1 ? 32 : 18;
					const isEmpty = intensity === 0;
					const Icon = intensity >= 90 ? Sun : intensity >= 50 ? Sun : intensity >= 1 ? CloudSun : Moon;

					return (
						<div key={i} className="flex flex-col items-center gap-2">
							{/* Sun/cloud */}
							<div
								className={`relative flex items-center justify-center transition-all ${
									day.isToday ? "scale-110" : ""
								}`}
								style={{ width: size, height: size }}
							>
								{!isEmpty && (
									<>
										{intensity >= 50 && (
											<div
												className="absolute inset-0 rounded-full bg-amber-300/30 blur-xl"
												style={{ transform: "scale(1.5)" }}
											/>
										)}
										<Icon
											className={`relative ${
												intensity >= 90
													? "text-amber-300 drop-shadow-[0_0_8px_rgb(252_211_77)]"
													: intensity >= 50
														? "text-amber-200"
														: "text-amber-100/70"
											}`}
											style={{ width: size * 0.7, height: size * 0.7 }}
											fill={intensity >= 90 ? "currentColor" : "none"}
											strokeWidth={1.8}
										/>
									</>
								)}
								{isEmpty && (
									<Icon className="size-4 text-white/30" strokeWidth={1.5} />
								)}
							</div>

							{/* Label del día */}
							<div className="flex flex-col items-center">
								<span
									className={`text-[10px] font-semibold uppercase ${
										day.isToday ? "text-white" : "text-white/50"
									}`}
								>
									{day.label}
								</span>
								{!isEmpty && (
									<span className="text-[9px] tabular-nums text-white/50 mt-0.5">
										{intensity}m
									</span>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{/* Línea horizontal sutil */}
			<div className="absolute bottom-0 inset-x-0 h-12 bg-linear-to-t from-amber-200/30 to-transparent" />
		</div>
	);
}
