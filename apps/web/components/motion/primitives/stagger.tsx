"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import {
	SLIDE_UP_VARIANTS,
	STAGGER_CONTAINER_VARIANTS,
} from "../variants";

type Props = {
	children: ReactNode;
	className?: string;
};

/**
 * Anima hijos uno tras otro con un pequeño delay entre cada uno.
 * Cada hijo debe envolverse en `<StaggerItem>` para participar.
 *
 * Uso:
 *   <Stagger>
 *     <StaggerItem><Card /></StaggerItem>
 *     <StaggerItem><Card /></StaggerItem>
 *   </Stagger>
 */
export function Stagger({ children, className }: Props) {
	return (
		<motion.div
			variants={STAGGER_CONTAINER_VARIANTS}
			initial="hidden"
			animate="visible"
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function StaggerItem({ children, className }: Props) {
	return (
		<motion.div variants={SLIDE_UP_VARIANTS} className={className}>
			{children}
		</motion.div>
	);
}
