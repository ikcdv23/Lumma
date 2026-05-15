"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { SCALE_IN_VARIANTS, TRANSITIONS } from "../variants";

type Props = {
	children: ReactNode;
	delay?: number;
	className?: string;
};

/**
 * Zoom-in con spring rebote sutil. Para feedback de éxito (check de
 * sesión completada), elementos celebratorios o popups que aparecen.
 */
export function ScaleIn({ children, delay = 0, className }: Props) {
	return (
		<motion.div
			variants={SCALE_IN_VARIANTS}
			initial="hidden"
			animate="visible"
			transition={{ ...TRANSITIONS.spring, delay }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
