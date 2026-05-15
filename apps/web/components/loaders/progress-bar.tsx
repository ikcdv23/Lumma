"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
	className?: string;
	label?: string;
};

/**
 * Barra de progreso INDETERMINADA (no conoce el % real). Para acciones de
 * 1-5 segundos donde sí queremos visual de "está pasando algo" pero el
 * tiempo no se puede medir (queries, lecturas, etc).
 *
 * Para barra determinada (% conocido), pasa un valor numérico al componente
 * del FloatingTimer en su lugar.
 */
export function ProgressBar({ className, label }: Props) {
	return (
		<div
			role="progressbar"
			aria-label={label ?? "Cargando"}
			className={cn(
				"relative h-1 w-full overflow-hidden rounded-full bg-amber-100",
				className,
			)}
		>
			<motion.div
				className="absolute inset-y-0 w-1/3 rounded-full bg-amber-500"
				animate={{ x: ["-100%", "300%"] }}
				transition={{
					duration: 1.4,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
		</div>
	);
}
