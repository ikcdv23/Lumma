import { Hammer, type LucideIcon } from "lucide-react";

export function ComingSoon({
	icon: Icon,
	title,
}: {
	icon: LucideIcon;
	title: string;
}) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
			<div className="flex size-16 items-center justify-center rounded-2xl bg-amber-50">
				<Icon className="size-7 text-amber-500" />
			</div>
			<div className="flex flex-col items-center gap-1 text-center">
				<h3 className="text-lg font-semibold">{title}</h3>
				<p className="text-sm text-muted-foreground">
					Próximamente — estamos cocinando esto
				</p>
				<div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
					<Hammer className="size-3.5" />
					<span>En desarrollo</span>
				</div>
			</div>
		</div>
	);
}
