import { cn } from "@/lib/utils";

type Props = {
	size?: "sm" | "md" | "lg";
	className?: string;
	label?: string;
};

const SIZES = {
	sm: "size-4 border-2",
	md: "size-6 border-2",
	lg: "size-10 border-3",
} as const;

/**
 * Spinner circular con stroke ámbar animado vía CSS (sin dependencias).
 * Para acciones cortas (≤ 2s). Para más, usa <ProgressBar /> o <Skeleton />.
 */
export function Spinner({ size = "md", className, label }: Props) {
	return (
		<span
			role="status"
			aria-label={label ?? "Cargando"}
			className={cn(
				"inline-block animate-spin rounded-full border-amber-500 border-t-transparent",
				SIZES[size],
				className,
			)}
		/>
	);
}
