"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
	value: number;
	onChange?: (value: number) => void;
	size?: "sm" | "default";
	className?: string;
};

export function StarRating({
	value,
	onChange,
	size = "default",
	className,
}: StarRatingProps) {
	const [hoverValue, setHoverValue] = useState<number | null>(null);
	const isInteractive = !!onChange;
	const displayValue = hoverValue ?? value;
	const sizeClass = size === "sm" ? "size-4" : "size-5";

	return (
		<div
			className={cn("flex items-center gap-0.5", className)}
			role={isInteractive ? "radiogroup" : undefined}
			aria-label={isInteractive ? "Calificación" : `Calificación: ${value} de 5`}
		>
			{[1, 2, 3, 4, 5].map((star) => {
				const filled = star <= displayValue;
				return (
					<button
						key={star}
						type="button"
						disabled={!isInteractive}
						onClick={() => onChange?.(star)}
						onMouseEnter={() => isInteractive && setHoverValue(star)}
						onMouseLeave={() => isInteractive && setHoverValue(null)}
						className={cn(
							"transition-transform",
							isInteractive
								? "cursor-pointer hover:scale-110"
								: "cursor-default",
						)}
						aria-label={`${star} ${star === 1 ? "estrella" : "estrellas"}`}
					>
						<Star
							className={cn(
								sizeClass,
								"transition-colors",
								filled
									? "fill-yellow-400 text-yellow-400"
									: "fill-transparent text-muted-foreground/40",
							)}
						/>
					</button>
				);
			})}
		</div>
	);
}
