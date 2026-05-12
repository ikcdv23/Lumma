import { Cloud } from "lucide-react";
import { SkyFooter } from "./sky-footer";

type Props = {
	todayMinutes: number;
	target: number;
	streak: number;
	/** Si true, oculta decoraciones secundarias (halo, nubes extra). */
	lowDetail?: boolean;
};

/**
 * Estado: media mañana. Paleta amber/azul, sol subiendo.
 * Activo entre 30% y 75% del target.
 */
export function SkyMorning({
	todayMinutes,
	target,
	streak,
	lowDetail = false,
}: Props) {
	const progressPct = Math.min((todayMinutes / target) * 100, 100);
	const sunBottom = 8 + progressPct * 0.6;
	const remaining = Math.max(target - todayMinutes, 0);

	return (
		<div className="relative h-80 overflow-hidden rounded-2xl border bg-card">
			{/* Sky gradient mañana */}
			<div
				className="absolute inset-0"
				style={{
					background: `linear-gradient(to bottom,
						rgb(186 230 253 / 0.7) 0%,
						rgb(254 240 138 / 0.5) 60%,
						rgb(255 237 213 / 0.3) 100%)`,
				}}
			/>

			{/* Halo del sol (DECORATIVO — candidato low-detail) */}
			{!lowDetail && (
				<div
					className="absolute size-48 rounded-full bg-amber-300/30 blur-3xl transition-all duration-1000"
					style={{
						left: "50%",
						bottom: `${sunBottom - 10}%`,
						transform: "translateX(-50%)",
					}}
				/>
			)}

			{/* Sol amarillo */}
			<div
				className="absolute size-16 rounded-full transition-all duration-1000"
				style={{
					left: "50%",
					bottom: `${sunBottom}%`,
					transform: "translateX(-50%)",
					background:
						"radial-gradient(circle at 35% 35%, rgb(254 240 138), rgb(251 191 36))",
					boxShadow: lowDetail
						? "none"
						: "0 25px 50px -12px rgb(251 191 36 / 0.4)",
				}}
			/>

			{/* Nubes (la primera siempre, extras solo en full detail) */}
			<Cloud
				className="absolute top-8 left-12 size-14 fill-white/70 stroke-white/0"
				strokeWidth={0}
			/>
			{!lowDetail && (
				<>
					<Cloud
						className="absolute top-16 right-16 size-10 fill-white/60 stroke-white/0"
						strokeWidth={0}
					/>
					<Cloud
						className="absolute top-4 right-32 size-6 fill-white/50 stroke-white/0"
						strokeWidth={0}
					/>
				</>
			)}

			{/* Línea de horizonte */}
			<div className="absolute bottom-24 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-300/50 to-transparent" />

			<SkyFooter todayMinutes={todayMinutes} streak={streak}>
				<p className="text-xs text-muted-foreground mt-1">
					Tu sol está al{" "}
					<span className="font-medium text-amber-600">
						{Math.round(progressPct)}%
					</span>
					. Faltan{" "}
					<span className="font-medium text-foreground">{remaining} min</span>{" "}
					para el mediodía.
				</p>
			</SkyFooter>
		</div>
	);
}
