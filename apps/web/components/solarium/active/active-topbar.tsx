import {
	LayoutGrid,
	ListTodo,
	NotebookPen,
	Sun,
	X,
	type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "notas" | "tareas" | "tablero";

export function ActiveTopbar({
	title,
	activeTab,
	onTabChange,
}: {
	title: string;
	activeTab: Tab;
	onTabChange: (tab: Tab) => void;
}) {
	return (
		<header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
			<div className="flex items-center gap-2">
				<Sun className="size-5 text-amber-500" />
				<span className="text-sm font-semibold">{title}</span>
			</div>

			<div className="flex flex-1 justify-center">
				<div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
					<TabButton
						icon={NotebookPen}
						label="Notas"
						active={activeTab === "notas"}
						onClick={() => onTabChange("notas")}
					/>
					<TabButton
						icon={ListTodo}
						label="Tareas"
						active={activeTab === "tareas"}
						onClick={() => onTabChange("tareas")}
					/>
					<TabButton
						icon={LayoutGrid}
						label="Tablero"
						active={activeTab === "tablero"}
						onClick={() => onTabChange("tablero")}
					/>
				</div>
			</div>

			{/* TODO: AlertDialog de confirmación antes de abandonar/completar */}
			<button
				type="button"
				className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-amber-400/60 hover:text-foreground"
			>
				<X className="size-4" />
				Terminar
			</button>
		</header>
	);
}

function TabButton({
	icon: Icon,
	label,
	active,
	onClick,
}: {
	icon: LucideIcon;
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
				active
					? "bg-background text-foreground shadow-sm"
					: "text-muted-foreground hover:text-foreground",
			)}
		>
			<Icon className="size-4" />
			{label}
		</button>
	);
}
