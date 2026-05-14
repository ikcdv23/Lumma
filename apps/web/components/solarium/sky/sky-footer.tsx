import { Flame } from "lucide-react";

/**
 * Footer compartido del SkyTodayCard: hoy + streak + copy variable.
 * El `children` es el copy contextual de cada fase (lo decide el padre).
 */
export function SkyFooter({
	todayMinutes,
	streak,
	children,
}: {
	todayMinutes: number;
	streak: number;
	children: React.ReactNode;
}) {
	return (
		<div className="absolute inset-x-0 bottom-0 p-5 bg-linear-to-t from-card via-card/90 to-transparent backdrop-blur-[2px]">
			<div className="flex items-end justify-between gap-4">
				<div>
					<div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
						Hoy
					</div>
					<div className="flex items-baseline gap-2 mt-0.5">
						<span className="text-4xl font-bold tabular-nums">
							{todayMinutes}
						</span>
						<span className="text-sm text-muted-foreground mb-0.5">min</span>
					</div>
					{children}
				</div>
				<div className="flex items-center gap-2 rounded-full bg-amber-100/70 px-3 py-1.5 ring-1 ring-amber-300/40">
					<Flame className="size-3.5 text-amber-600" />
					<span className="text-sm font-semibold tabular-nums text-amber-900">
						{streak}
					</span>
					<span className="text-xs text-amber-700/80">días al sol</span>
				</div>
			</div>
		</div>
	);
}
