import { SkyDawn } from "./sky-dawn";
import { SkyMidday } from "./sky-midday";
import { SkyMorning } from "./sky-morning";
import { SkyNight } from "./sky-night";

type Props = {
	todayMinutes: number;
	target: number;
	streak: number;
	/** Si true, oculta decoraciones secundarias (halos, nubes extra, estrellas extra). */
	lowDetail?: boolean;
};

/**
 * Decide qué cielo mostrar según los minutos estudiados hoy.
 *
 * Fases:
 *  - 0 min        → night (predawn, aún no ha amanecido)
 *  - 1 – 30%      → dawn (amanece, coral)
 *  - 30% – 75%    → morning (amber, sol subiendo)
 *  - 75%+         → midday (sol pleno)
 */
export function SkyToday({ todayMinutes, target, streak, lowDetail }: Props) {
	if (todayMinutes <= 4) {
		return (
			<SkyNight
				todayMinutes={todayMinutes}
				streak={streak}
				lowDetail={lowDetail}
			/>
		);
	}

	const progressPct = Math.min((todayMinutes / target) * 100, 100);

	if (progressPct < 30) {
		return (
			<SkyDawn
				todayMinutes={todayMinutes}
				target={target}
				streak={streak}
				lowDetail={lowDetail}
			/>
		);
	}

	if (progressPct < 75) {
		return (
			<SkyMorning
				todayMinutes={todayMinutes}
				target={target}
				streak={streak}
				lowDetail={lowDetail}
			/>
		);
	}

	return (
		<SkyMidday
			todayMinutes={todayMinutes}
			target={target}
			streak={streak}
			lowDetail={lowDetail}
		/>
	);
}
