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
 * Estado: amanece. Cielo coral/rosa con sol naranja asomando bajo.
 * Activo desde 1 min hasta progreso < 30% del target.
 */
export function SkyDawn({
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
			{/* Sky gradient amanecer (coral / rosa) */}
			<div
				className="absolute inset-0"
				style={{
					background: `linear-gradient(to bottom,
						rgb(165 135 195 / 0.55) 0%,
						rgb(252 211 191 / 0.6) 50%,
						rgb(254 215 170 / 0.45) 100%)`,
				}}
			/>

			{/* Halo del sol (DECORATIVO — candidato low-detail) */}
			{!lowDetail && (
				<div
					className="absolute size-48 rounded-full bg-red-300/35 blur-3xl transition-all duration-1000"
					style={{
						left: "50%",
						bottom: `${sunBottom - 10}%`,
						transform: "translateX(-50%)",
					}}
				/>
			)}

			{/* Sol naranja amaneciendo */}
			<div
				className="absolute size-16 rounded-full transition-all duration-1000"
				style={{
					left: "50%",
					bottom: `${sunBottom}%`,
					transform: "translateX(-50%)",
					background:
						"radial-gradient(circle at 35% 35%, rgb(254 215 170), rgb(251 146 60))",
					boxShadow: lowDetail ? "none" : "0 0 40px rgb(251 146 60 / 0.4)",
				}}
			/>

			{/* Nubes (la primera siempre, extras solo en full detail) */}
			<Cloud
				className="absolute top-8 left-12 size-14 fill-white/60 stroke-white/0"
				strokeWidth={0}
			/>
			{!lowDetail && (
				<>
					<Cloud
						className="absolute top-16 right-16 size-10 fill-white/50 stroke-white/0"
						strokeWidth={0}
					/>
					<Cloud
						className="absolute top-4 right-32 size-6 fill-white/40 stroke-white/0"
						strokeWidth={0}
					/>
				</>
			)}

			{/* Línea de horizonte */}
			<div className="absolute bottom-24 left-0 right-0 h-px bg-linear-to-r from-transparent via-orange-300/50 to-transparent" />

			<SkyFooter todayMinutes={todayMinutes} streak={streak}>
				<p className="text-xs text-muted-foreground mt-1">
					Tu sol está{" "}
					<span className="font-medium text-orange-600">amaneciendo</span>.
					Faltan{" "}
					<span className="font-medium text-foreground">{remaining} min</span>{" "}
					para el mediodía.
				</p>
			</SkyFooter>
		</div>
	);
}
