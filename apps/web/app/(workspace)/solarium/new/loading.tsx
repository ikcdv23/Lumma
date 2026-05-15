import { ShimmerBlock } from "@/components/loaders";

export default function NewSessionLoading() {
	return (
		<div className="flex flex-col gap-8 p-6 md:p-8 w-full max-w-5xl mx-auto">
			<ShimmerBlock className="h-4 w-32 rounded" />

			<div className="flex flex-col gap-2">
				<ShimmerBlock className="h-8 w-56 rounded" />
				<ShimmerBlock className="h-3.5 w-96 rounded" />
			</div>

			<div className="flex flex-col gap-3">
				<ShimmerBlock className="h-3 w-24 rounded" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
					{Array.from({ length: 6 }).map((_, i) => (
						<ShimmerBlock key={i} className="h-16 rounded-lg" />
					))}
				</div>
			</div>

			<div className="flex flex-col gap-3">
				<ShimmerBlock className="h-3 w-20 rounded" />
				<div className="flex gap-3">
					<ShimmerBlock className="h-24 flex-1 rounded-xl" />
					<ShimmerBlock className="h-24 flex-1 rounded-xl" />
					<ShimmerBlock className="h-24 flex-1 rounded-xl" />
				</div>
			</div>

			<ShimmerBlock className="h-12 rounded-md" />
		</div>
	);
}
