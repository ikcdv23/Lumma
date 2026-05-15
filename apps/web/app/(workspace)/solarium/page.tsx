import Link from "next/link";
import { redirect } from "next/navigation";
import { Cloud, CloudSun, Sun, Zap } from "lucide-react";
import { auth } from "@/auth";
import { SkyToday } from "@/components/solarium/sky";
import { SolariumInfoButton } from "@/components/solarium/solarium-info-button";
import { FadeIn, SlideUp, Stagger, StaggerItem } from "@/components/motion";
import * as solariumService from "@/server/solarium/solarium.service";

export const metadata = { title: "Solarium" };

const TARGET = 90;

export default async function SolariumPage() {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");

	const userId = session.user.id;

	const [recentSessions, streak, todayMinutes] = await Promise.all([
		solariumService.getRecentSessions(userId, 6),
		solariumService.getStreak(userId),
		solariumService.getTodayStudyMinutes(userId),
	]);

	const hasRecent = recentSessions.length > 0;

	return (
		<div className="flex flex-col gap-8 p-6 md:p-8 w-full max-w-5xl mx-auto">
			{/* Header */}
			<FadeIn className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					<Sun className="size-7 text-amber-500" />
					<h1 className="text-3xl font-bold tracking-tight">Solarium</h1>
					<SolariumInfoButton />
				</div>
				<p className="text-sm text-muted-foreground">
					Tu espacio para sesiones de estudio enfocadas
				</p>
			</FadeIn>

			{/* CTA principal */}
			<SlideUp delay={0.08}>
				<Link
					href="/solarium/new"
					className="flex items-center gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-amber-400/60"
				>
					<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
						<Zap className="size-5 text-amber-600" strokeWidth={2} />
					</div>
					<div className="flex flex-col items-start min-w-0">
						<span className="text-base font-semibold">Empezar a estudiar</span>
						<span className="text-xs text-muted-foreground">
							Configura tu sesión enfocada
						</span>
					</div>
				</Link>
			</SlideUp>

			{/* HERO — Cielo del día */}
			<SlideUp delay={0.16}>
				<SkyToday
					todayMinutes={todayMinutes}
					target={TARGET}
					streak={streak}
				/>
			</SlideUp>

			{/* Sesiones recientes */}
			<section className="flex flex-col gap-3">
				<FadeIn delay={0.24}>
					<h2 className="text-sm font-medium text-muted-foreground">
						Sesiones recientes
					</h2>
				</FadeIn>

				{hasRecent ? (
					<Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{recentSessions.map((s) => (
							<StaggerItem key={s.id}>
								<RecentSessionCard
									folder={s.title}
									duration={s.studyMinutes}
									when={formatWhen(s.startedAt)}
								/>
							</StaggerItem>
						))}
					</Stagger>
				) : (
					<FadeIn delay={0.3}>
						<div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-12 px-6 text-center">
							<div className="flex size-12 items-center justify-center rounded-full bg-amber-100">
								<Sun className="size-6 text-amber-500" />
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
					</FadeIn>
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
// TODO: hacer clickable → /solarium/sessions/[id] con ficha técnica
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
			: "text-muted-foreground";

	return (
		<div className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-amber-400/60 cursor-pointer">
			<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
				<Icon
					className={`size-5 ${iconColor}`}
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
	);
}
