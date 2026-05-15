"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
	className?: string;
	label?: string;
};

/**
 * Punto pulsante para pending inline (botones de "Creando..." / "Guardando...").
 * Más sutil que un spinner — útil cuando ya hay copy de estado y solo necesitas
 * indicar actividad sin robar protagonismo.
 */
export function PulseDot({ className, label }: Props) {
	return (
		<motion.span
			role="status"
			aria-label={label ?? "Procesando"}
			className={cn(
				"inline-block size-1.5 rounded-full bg-amber-500",
				className,
			)}
			animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
			transition={{
				duration: 1.2,
				repeat: Infinity,
				ease: "easeInOut",
			}}
		/>
	);
}
