import Link from "next/link";
import { redirect } from "next/navigation";
import { Cloud, CloudSun, Sun, Zap } from "lucide-react";
import { auth } from "@/auth";
import { SkyToday } from "@/components/solarium/sky";
import * as solariumService from "@/server/solarium/solarium.service";

export const metadata = { title: "Solario" };

// TODO: reemplazar por getTodayStudyMinutes(userId) cuando exista en el service
const TODAY_MINUTES = 0;
const TARGET = 90;

export default async function SolariumPage() {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");

	const userId = session.user.id;

	const [recentSessions, streak] = await Promise.all([
		solariumService.getRecentSessions(userId, 6),
		solariumService.getStreak(userId),
	]);

	const hasRecent = recentSessions.length > 0;

	return (
		<div className="flex flex-col gap-12 p-6 md:p-12 w-full max-w-5xl mx-auto mt-10">
			{/* Header */}
			<div className="flex flex-col gap-1">
				<h1 className="text-3xl font-bold tracking-tight">Solario</h1>
				<p className="text-sm text-muted-foreground">
					Tu espacio para sesiones de estudio enfocadas
				</p>
			</div>

			{/* CTA principal — cuando haya sesion ACTIVE, swap a "Reanudar" → /active */}
			<Link
				href="/solarium/new"
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
					<span className="text-base font-semibold">Iniciar sesión</span>
					<span className="text-xs text-muted-foreground">
						Empieza una sesión enfocada ahora
					</span>
				</div>
			</Link>

			{/* HERO — Cielo del día */}
			<SkyToday
				todayMinutes={TODAY_MINUTES}
				target={TARGET}
				streak={streak}
			/>

			{/* Sesiones recientes */}
			<section className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-medium text-muted-foreground">
						Sesiones recientes
					</h2>
				</div>

				{hasRecent ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{recentSessions.map((s) => (
							<RecentSessionCard
								key={s.id}
								folder={s.folder?.name ?? s.title}
								duration={s.studyMinutes}
								when={formatWhen(s.startedAt)}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/50 py-12 px-6 text-center">
						<div className="flex size-12 items-center justify-center rounded-full bg-amber-100/70 ring-1 ring-amber-200/50">
							<Sun className="size-6 text-amber-400" />
						</div>
						<div className="flex flex-col gap-1">
							<h3 className="text-base font-semibold">
								Aún no tienes sesiones
							</h3>
							<p className="text-sm text-muted-foreground max-w-xs">
								Empieza una para llenar tu cielo
							</p>
						</div>
					</div>
				)}
			</section>
		</div>
	);
}

function formatWhen(date: Date): string {
	const diffMs = Date.now() - date.getTime();
	const diffMin = Math.floor(diffMs / 60_000);
	const diffH = Math.floor(diffMin / 60);
	const diffD = Math.floor(diffH / 24);

	if (diffMin < 1) return "ahora mismo";
	if (diffMin < 60) return `hace ${diffMin} min`;
	if (diffH < 24) return `hace ${diffH}h`;
	if (diffD === 1) return "ayer";
	if (diffD < 7) return `hace ${diffD} días`;
	return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

// ─────────────────────────────────────────────────────
// Recent session card
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
			{/* Halo de sol */}
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
