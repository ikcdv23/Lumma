import { SkeletonCard, ShimmerBlock } from "@/components/loaders";

export default function SolariumLoading() {
	return (
		<div className="flex flex-col gap-8 p-6 md:p-8 w-full max-w-5xl mx-auto">
			<div className="flex flex-col gap-2">
				<ShimmerBlock className="h-8 w-44 rounded" />
				<ShimmerBlock className="h-3.5 w-72 rounded" />
			</div>

			<ShimmerBlock className="h-20 rounded-xl" />

			<ShimmerBlock className="h-48 rounded-2xl" />

			<div className="flex flex-col gap-3">
				<ShimmerBlock className="h-3 w-32 rounded" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			</div>
		</div>
	);
}
