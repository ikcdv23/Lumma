"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { SLIDE_UP_VARIANTS, TRANSITIONS } from "../variants";

type Props = {
	children: ReactNode;
	delay?: number;
	className?: string;
};

/**
 * Entrada desde abajo con fade. Ideal para cards, secciones de página y
 * paneles laterales que aparecen tras un evento.
 */
export function SlideUp({ children, delay = 0, className }: Props) {
	return (
		<motion.div
			variants={SLIDE_UP_VARIANTS}
			initial="hidden"
			animate="visible"
			transition={{ ...TRANSITIONS.soft, delay }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
