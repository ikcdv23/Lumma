import Link from "next/link";
import {
	Flame,
	Cloud,
	Sun,
	CloudSun,
	Zap,
	Timer,
	Layers,
	Sparkles,
	BookOpenCheck,
	LayoutTemplate,
} from "lucide-react";
import { TemplatesSection } from "./_components/templates-section";

export const metadata = { title: "Herramientas de estudio — Mockup" };

// Mock data
const TODAY_MINUTES = 50;
const TARGET = 90;
const STREAK = 7;

const tools = [
	{
		name: "Sesión Pomodoro",
		desc: "Estudia con bloques de tiempo",
		icon: Timer,
		available: true,
	},
	{
		name: "Flashcards",
		desc: "Repasa con tarjetas (IA por Luminita)",
		icon: Layers,
		available: false,
	},
	{
		name: "Resumen IA",
		desc: "Genera un resumen de tus notas (Luminita)",
		icon: Sparkles,
		available: false,
	},
	{
		name: "Quiz rápido",
		desc: "Tests autogenerados (Luminita)",
		icon: BookOpenCheck,
		available: false,
	},
];

const recentSessions = [
	{ folder: "Matemáticas", duration: 95, when: "hace 2h" },
	{ folder: "Historia", duration: 50, when: "ayer" },
	{ folder: "Inglés", duration: 30, when: "hace 2 días" },
];

export default function StudyToolsHub() {
	return (
		<div className="flex flex-col gap-12 p-6 md:p-12 w-full max-w-5xl mx-auto mt-10">
			{/* Header */}
			<div className="flex flex-col gap-1">
				<h1 className="text-3xl font-bold tracking-tight">
					Herramientas de estudio
				</h1>
				<p className="text-sm text-muted-foreground">
					Compón tu sesión perfecta a partir de los bloques disponibles
				</p>
			</div>

			{/* CTAs duales: sesión rápida vs desde plantilla */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				{/* Sesión rápida */}
				<Link
					href="/sessions-mockup/new"
					className="group flex items-center gap-4 rounded-xl border bg-card p-5 transition-all hover:border-amber-300/60 hover:shadow-md hover:-translate-y-0.5"
				>
					<div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-200 to-amber-400 shadow-sm transition-transform duration-300 group-hover:scale-105">
						<Zap
							className="size-5 text-amber-50"
							strokeWidth={2.5}
							fill="currentColor"
						/>
					</div>
					<div className="flex flex-col items-start min-w-0">
						<span className="text-base font-semibold">Sesión rápida</span>
						<span className="text-xs text-muted-foreground">
							Empieza ahora con valores por defecto
						</span>
					</div>
				</Link>

				{/* Desde plantilla */}
				<Link
					href="#plantillas"
					className="group flex items-center gap-4 rounded-xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
				>
					<div className="relative flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
						<LayoutTemplate className="size-5" />
					</div>
					<div className="flex flex-col items-start min-w-0">
						<span className="text-base font-semibold">Desde plantilla</span>
						<span className="text-xs text-muted-foreground">
							Reutiliza una configuración guardada
						</span>
					</div>
				</Link>
			</div>

			{/* HERO — Cielo del día */}
			<SkyTodayCard />

			{/* Plantillas (con modales de preview + create) */}
			<TemplatesSection />

			{/* Herramientas */}
			<section className="flex flex-col gap-3">
				<h2 className="text-sm font-medium text-muted-foreground">
					Herramientas (piezas)
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{tools.map((t) => {
						const Icon = t.icon;
						return (
							<div
								key={t.name}
								className={`group relative flex items-start gap-4 rounded-xl border bg-card p-5 transition-all ${
									t.available
										? "hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
										: "opacity-60"
								}`}
							>
								<div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<Icon className="size-5" />
								</div>
								<div className="flex flex-col gap-1 min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<h3 className="font-semibold text-base">{t.name}</h3>
										{!t.available && (
											<span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
												Próximamente
											</span>
										)}
									</div>
									<p className="text-sm text-muted-foreground">{t.desc}</p>
								</div>
							</div>
						);
					})}
				</div>
			</section>

			{/* Sesiones recientes — con guiño a C (suns con halo) */}
			<section className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-medium text-muted-foreground">
						Sesiones recientes
					</h2>
					<button
						type="button"
						className="text-xs text-muted-foreground hover:text-foreground transition-colors"
					>
						Ver todas →
					</button>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{recentSessions.map((s, i) => (
						<RecentSessionCard
							key={i}
							folder={s.folder}
							duration={s.duration}
							when={s.when}
						/>
					))}
				</div>
			</section>

			{/* Mockup nav helper */}
			<section className="flex flex-col gap-2 rounded-xl border border-dashed bg-muted/20 p-4">
				<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Navegación entre mockups
				</h3>
				<div className="flex flex-wrap gap-2 text-sm">
					<Link
						href="/sessions-mockup/variants"
						className="rounded-md bg-amber-100 px-3 py-1.5 hover:bg-amber-200 transition-colors text-amber-900 font-medium ring-1 ring-amber-300/40"
					>
						✨ Variantes calendar/streak
					</Link>
					<Link
						href="/sessions-mockup/new"
						className="rounded-md bg-card px-3 py-1.5 hover:bg-muted transition-colors"
					>
						→ Crear sesión
					</Link>
					<Link
						href="/sessions-mockup/regret"
						className="rounded-md bg-card px-3 py-1.5 hover:bg-muted transition-colors"
					>
						→ Ventana arrepentimiento
					</Link>
					<Link
						href="/sessions-mockup/active"
						className="rounded-md bg-card px-3 py-1.5 hover:bg-muted transition-colors"
					>
						→ Sesión activa
					</Link>
					<Link
						href="/sessions-mockup/result?status=completed"
						className="rounded-md bg-card px-3 py-1.5 hover:bg-muted transition-colors"
					>
						→ Completada
					</Link>
					<Link
						href="/sessions-mockup/result?status=failed"
						className="rounded-md bg-card px-3 py-1.5 hover:bg-muted transition-colors"
					>
						→ Incompleta
					</Link>
				</div>
			</section>
		</div>
	);
}

// ─────────────────────────────────────────────────────
// HERO — Cielo del día (Variante A)
// ─────────────────────────────────────────────────────
function SkyTodayCard() {
	const progressPct = Math.min((TODAY_MINUTES / TARGET) * 100, 100);
	const sunBottom = 8 + progressPct * 0.6;

	return (
		<div className="relative h-80 overflow-hidden rounded-2xl border bg-card">
			{/* Sky gradient */}
			<div
				className="absolute inset-0"
				style={{
					background: `linear-gradient(to bottom,
						rgb(186 230 253 / 0.7) 0%,
						rgb(254 240 138 / 0.5) 60%,
						rgb(255 237 213 / 0.3) 100%)`,
				}}
			/>

			{/* Sun halo / glow */}
			<div
				className="absolute size-48 rounded-full bg-amber-300/30 blur-3xl transition-all duration-1000"
				style={{
					left: "50%",
					bottom: `${sunBottom - 10}%`,
					transform: "translateX(-50%)",
				}}
			/>

			{/* Sun */}
			<div
				className="absolute size-16 rounded-full shadow-2xl shadow-amber-400/40 transition-all duration-1000"
				style={{
					left: "50%",
					bottom: `${sunBottom}%`,
					transform: "translateX(-50%)",
					background:
						"radial-gradient(circle at 35% 35%, rgb(254 240 138), rgb(251 191 36))",
				}}
			/>

			{/* Decorative clouds */}
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

			{/* Horizon line */}
			<div className="absolute bottom-24 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-300/50 to-transparent" />

			{/* Footer with stats */}
			<div className="absolute inset-x-0 bottom-0 p-5 bg-linear-to-t from-card via-card/90 to-transparent backdrop-blur-[2px]">
				<div className="flex items-end justify-between gap-4">
					<div>
						<div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
							Hoy
						</div>
						<div className="flex items-baseline gap-2 mt-0.5">
							<span className="text-4xl font-bold tabular-nums">
								{TODAY_MINUTES}
							</span>
							<span className="text-sm text-muted-foreground mb-0.5">min</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Tu sol está al{" "}
							<span className="font-medium text-amber-600">
								{Math.round(progressPct)}%
							</span>
							. Faltan{" "}
							<span className="font-medium text-foreground">
								{TARGET - TODAY_MINUTES} min
							</span>{" "}
							para el mediodía.
						</p>
					</div>
					<div className="flex items-center gap-2 rounded-full bg-amber-100/70 px-3 py-1.5 ring-1 ring-amber-300/40">
						<Flame className="size-3.5 text-amber-600" />
						<span className="text-sm font-semibold tabular-nums text-amber-900">
							{STREAK}
						</span>
						<span className="text-xs text-amber-700/80">días al sol</span>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────
// Recent session card — guiño a Variante C
// ─────────────────────────────────────────────────────
function RecentSessionCard({
	folder,
	duration,
	when,
}: {
	folder: string;
	duration: number;
	when: string;
}) {
	const isFull = duration >= 90;
	const isPartial = duration >= 50;

	const Icon = isFull ? Sun : isPartial ? CloudSun : Cloud;
	const iconColor = isFull
		? "text-amber-500"
		: isPartial
			? "text-amber-400"
			: "text-amber-300";
	const haloIntensity = isFull
		? "opacity-100"
		: isPartial
			? "opacity-60"
			: "opacity-30";

	return (
		<div className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
			{/* Halo de sol — guiño a C */}
			<div
				className={`pointer-events-none absolute -left-6 -top-6 size-24 rounded-full bg-amber-300/30 blur-2xl ${haloIntensity}`}
			/>
			<div
				className={`pointer-events-none absolute -right-8 -bottom-8 size-20 rounded-full bg-amber-200/20 blur-2xl ${haloIntensity}`}
			/>

			{/* Contenido */}
			<div className="relative flex items-center gap-3">
				<div className="relative flex size-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-200/50">
					<Icon
						className={`size-5 ${iconColor} transition-transform group-hover:scale-110`}
						strokeWidth={2}
						fill={isFull ? "currentColor" : "none"}
					/>
				</div>
				<div className="flex flex-col gap-0.5 min-w-0 flex-1">
					<h3 className="font-semibold text-sm truncate">{folder}</h3>
					<p className="text-xs text-muted-foreground tabular-nums">
						{duration} min · {when}
					</p>
				</div>
			</div>
		</div>
	);
}
