"use client";

import { motion } from "motion/react";
import { Sun } from "lucide-react";

type Props = {
	message?: string;
};

/**
 * Loader de página entera con marca Lumma (Sun ámbar pulsando).
 * Reservar para transiciones de ruta que tarden (carga inicial de /active,
 * etc). Para esperas dentro de una pantalla, usar componentes más pequeños.
 */
export function FullPageLoader({ message }: Props) {
	return (
		<div
			role="status"
			aria-live="polite"
			className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background"
		>
			<motion.div
				animate={{ scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
				transition={{
					duration: 1.6,
					repeat: Infinity,
					ease: "easeInOut",
				}}
				className="flex size-16 items-center justify-center rounded-2xl bg-amber-50"
			>
				<Sun className="size-8 text-amber-500" />
			</motion.div>
			{message && (
				<p className="text-sm text-muted-foreground">{message}</p>
			)}
		</div>
	);
}
