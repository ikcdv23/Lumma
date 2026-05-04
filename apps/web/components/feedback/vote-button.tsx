"use client";

import { useFormStatus } from "react-dom";
import { Heart, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

type VoteButtonProps = {
	count: number;
	voted: boolean;
};

export function VoteButton({ count, voted }: VoteButtonProps) {
	const { pending } = useFormStatus();

	return (
		<button
			type="submit"
			disabled={pending}
			className={cn(
				"flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
				"hover:scale-105 active:scale-95",
				voted
					? "border-primary/40 bg-primary/10 text-primary"
					: "border-border bg-card text-muted-foreground hover:border-primary/30",
				pending && "opacity-50 cursor-not-allowed",
			)}
			aria-label={voted ? "Quitar voto" : "Votar"}
		>
			{pending ? (
				<Loader2 className="size-4 animate-spin" />
			) : (
				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						key={voted ? "voted" : "not-voted"}
						initial={{ scale: 0.5, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.5, opacity: 0 }}
						transition={{ type: "spring", stiffness: 500, damping: 25 }}
					>
						<Heart
							className={cn("size-4", voted && "fill-current")}
						/>
					</motion.div>
				</AnimatePresence>
			)}
			<span className="tabular-nums">{count}</span>
		</button>
	);
}
