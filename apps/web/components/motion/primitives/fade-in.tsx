"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { FADE_IN_VARIANTS, TRANSITIONS } from "../variants";

type Props = {
	children: ReactNode;
	delay?: number;
	duration?: number;
	className?: string;
};

/**
 * Wrapper de entrada con fade. Encapsula motion para que las pages no
 * dependan directamente de la librería (DIP).
 */
export function FadeIn({ children, delay = 0, duration, className }: Props) {
	return (
		<motion.div
			variants={FADE_IN_VARIANTS}
			initial="hidden"
			animate="visible"
			transition={{
				...TRANSITIONS.soft,
				delay,
				...(duration && { duration }),
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}
