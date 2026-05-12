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
 * Estado: mediodía. Sol pleno arriba, paleta saturada.
 * Activo desde 75% del target (incluido superar el target).
 */
export function SkyMidday({
	todayMinutes,
	target,
	streak,
	lowDetail = false,
}: Props) {
	const progressPct = Math.min((todayMinutes / target) * 100, 100);
	const sunBottom = 8 + progressPct * 0.6;

	return (
		<div className="relative h-80 overflow-hidden rounded-2xl border bg-card">
			{/* Sky gradient mediodía (más saturado) */}
			<div
				className="absolute inset-0"
				style={{
					background: `linear-gradient(to bottom,
						rgb(125 211 252 / 0.85) 0%,
						rgb(253 224 71 / 0.55) 55%,
						rgb(254 215 170 / 0.3) 100%)`,
				}}
			/>

			{/* Halo del sol (DECORATIVO — candidato low-detail) */}
			{!lowDetail && (
				<div
					className="absolute size-56 rounded-full bg-yellow-300/45 blur-3xl transition-all duration-1000"
					style={{
						left: "50%",
						bottom: `${sunBottom - 10}%`,
						transform: "translateX(-50%)",
					}}
				/>
			)}

			{/* Sol pleno */}
			<div
				className="absolute size-16 rounded-full transition-all duration-1000"
				style={{
					left: "50%",
					bottom: `${sunBottom}%`,
					transform: "translateX(-50%)",
					background:
						"radial-gradient(circle at 35% 35%, rgb(254 252 232), rgb(250 204 21))",
					boxShadow: lowDetail
						? "none"
						: "0 25px 50px -12px rgb(250 204 21 / 0.5)",
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
			<div className="absolute bottom-24 left-0 right-0 h-px bg-linear-to-r from-transparent via-yellow-300/60 to-transparent" />

			<SkyFooter todayMinutes={todayMinutes} streak={streak}>
				<p className="text-xs text-muted-foreground mt-1">
					<span className="font-medium text-amber-600">Sol pleno</span>. Has
					llegado al mediodía.
				</p>
			</SkyFooter>
		</div>
	);
}
