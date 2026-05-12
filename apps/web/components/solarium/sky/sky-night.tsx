import { Cloud, Moon, Star } from "lucide-react";
import { SkyFooter } from "./sky-footer";

type Props = {
	todayMinutes: number;
	streak: number;
	/** Si true, oculta decoraciones secundarias (estrellas extra, nubes extra). */
	lowDetail?: boolean;
};

/**
 * Estado: 0 min hoy. Aún no ha amanecido.
 * Cielo nocturno con luna y estrellas. Sin sol.
 */
export function SkyNight({ todayMinutes, streak, lowDetail = false }: Props) {
	return (
		<div className="relative h-80 overflow-hidden rounded-2xl border bg-card">
			{/* Sky gradient nocturno */}
			<div
				className="absolute inset-0"
				style={{
					background: `linear-gradient(to bottom,
						rgb(30 27 75 / 0.95) 0%,
						rgb(67 56 132 / 0.85) 50%,
						rgb(99 102 153 / 0.7) 100%)`,
				}}
			/>

			{/* Luna con halo */}
			<div className="absolute right-12 top-10 flex items-center justify-center">
				{/* Halo de la luna (DECORATIVO — candidato low-detail) */}
				{!lowDetail && (
					<div className="absolute size-20 rounded-full bg-indigo-200/15 blur-2xl" />
				)}
				<Moon
					className="relative size-7 text-indigo-100/80"
					fill="currentColor"
					strokeWidth={0}
				/>
			</div>

			{/* Estrellas (DECORATIVO — candidato low-detail) */}
			{!lowDetail && (
				<>
					<Star
						className="absolute top-6 left-20 size-3 text-indigo-100/60"
						fill="currentColor"
						strokeWidth={0}
					/>
					<Star
						className="absolute top-14 left-1/3 size-2 text-indigo-100/50"
						fill="currentColor"
						strokeWidth={0}
					/>
					<Star
						className="absolute top-20 right-1/3 size-2.5 text-indigo-100/60"
						fill="currentColor"
						strokeWidth={0}
					/>
					<Star
						className="absolute top-32 left-16 size-2 text-indigo-100/40"
						fill="currentColor"
						strokeWidth={0}
					/>
					<Star
						className="absolute top-10 right-1/4 size-1.5 text-indigo-100/50"
						fill="currentColor"
						strokeWidth={0}
					/>
				</>
			)}

			{/* Nubes nocturnas (la primera siempre, las otras solo en full detail) */}
			<Cloud
				className="absolute top-8 left-12 size-14 fill-indigo-300/40 stroke-white/0"
				strokeWidth={0}
			/>
			{!lowDetail && (
				<>
					<Cloud
						className="absolute top-16 right-16 size-10 fill-indigo-300/40 stroke-white/0"
						strokeWidth={0}
					/>
					<Cloud
						className="absolute top-4 right-32 size-6 fill-indigo-300/40 stroke-white/0"
						strokeWidth={0}
					/>
				</>
			)}

			<SkyFooter todayMinutes={todayMinutes} streak={streak}>
				<p className="text-xs text-muted-foreground mt-1">
					Tu cielo aún{" "}
					<span className="font-medium text-foreground">no ha amanecido</span>.
					Empieza una sesión para que salga el sol.
				</p>
			</SkyFooter>
		</div>
	);
}
