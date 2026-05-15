import { cn } from "@/lib/utils";

type Props = {
	className?: string;
};

/**
 * Placeholder rectangular con shimmer ámbar. Usar mientras carga una card
 * con título + subtítulo (sesión reciente, fila de carpeta, etc).
 *
 * Composición por encima de shadcn Skeleton para mantener la paleta ámbar
 * de Lumma en lugar del gris default.
 */
export function SkeletonCard({ className }: Props) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 rounded-xl border bg-card p-4",
				className,
			)}
		>
			<ShimmerBlock className="size-10 shrink-0 rounded-lg" />
			<div className="flex flex-1 flex-col gap-1.5">
				<ShimmerBlock className="h-3.5 w-3/4 rounded" />
				<ShimmerBlock className="h-3 w-1/2 rounded" />
			</div>
		</div>
	);
}

export function ShimmerBlock({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"animate-pulse bg-gradient-to-r from-muted via-amber-50 to-muted bg-[length:200%_100%]",
				className,
			)}
		/>
	);
}
