"use client";

import { motion, AnimatePresence } from "motion/react";
import { Check, Loader2 } from "lucide-react";

type SaveIndicatorProps = {
	status: "idle" | "saving" | "saved";
};

export function SaveIndicator({ status }: SaveIndicatorProps) {
	return (
		<AnimatePresence mode="wait">
			{status === "saving" && (
				<motion.div
					key="saving"
					initial={{ opacity: 0, x: -6 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 6 }}
					transition={{ duration: 0.18 }}
					className="flex items-center gap-1.5 text-xs text-muted-foreground"
				>
					<Loader2 className="size-3.5 animate-spin" />
					<span>Guardando...</span>
				</motion.div>
			)}
			{status === "saved" && (
				<motion.div
					key="saved"
					initial={{ opacity: 0, scale: 0.6 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.8 }}
					transition={{
						type: "spring",
						damping: 14,
						stiffness: 500,
					}}
					className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
				>
					<motion.span
						initial={{ rotate: -30, scale: 0 }}
						animate={{ rotate: 0, scale: 1 }}
						transition={{
							type: "spring",
							damping: 10,
							stiffness: 400,
							delay: 0.05,
						}}
						className="flex"
					>
						<Check className="size-3.5" strokeWidth={3} />
					</motion.span>
					<span>Guardado</span>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
