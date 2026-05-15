import type { Transition, Variants } from "motion/react";

/**
 * Curvas y duraciones reusables. Mantén el feel coherente en toda la app:
 * - SOFT: para entradas/salidas de UI (cards, modals)
 * - SNAPPY: para feedback rápido (botones, toggles)
 * - SPRING: para elementos que deben sentirse físicos (timer expand, drag)
 */
export const TRANSITIONS = {
	soft: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as Transition,
	snappy: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } as Transition,
	spring: { type: "spring", stiffness: 320, damping: 26 } as Transition,
	gentle: { type: "spring", stiffness: 180, damping: 22 } as Transition,
} as const;

export const FADE_IN_VARIANTS: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: TRANSITIONS.soft },
};

export const SLIDE_UP_VARIANTS: Variants = {
	hidden: { opacity: 0, y: 12 },
	visible: { opacity: 1, y: 0, transition: TRANSITIONS.soft },
};

export const SCALE_IN_VARIANTS: Variants = {
	hidden: { opacity: 0, scale: 0.92 },
	visible: { opacity: 1, scale: 1, transition: TRANSITIONS.spring },
};

export const STAGGER_CONTAINER_VARIANTS: Variants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.06,
			delayChildren: 0.04,
		},
	},
};
