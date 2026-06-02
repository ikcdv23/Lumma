"use client";

import { useState, useTransition } from "react";
import {
	ArrowRight,
	Check,
	Circle,
	MoreHorizontal,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { KanbanStatus } from "@/generated/prisma/client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/confirm/confirm-provider";
import {
	createKanbanCardAction,
	deleteKanbanCardAction,
	moveKanbanCardAction,
	renameKanbanCardAction,
} from "@/server/kanban/kanban.actions";

type Card = {
	id: string;
	title: string;
	status: KanbanStatus;
	createdAt: Date;
	updatedAt: Date;
};

type Props = {
	sessionId: string;
	initialCards: Card[];
};

type ColumnConfig = {
	status: KanbanStatus;
	label: string;
	helper: string;
	icon: typeof Circle;
	iconClass: string;
};

const COLUMNS: ColumnConfig[] = [
	{
		status: "PENDING",
		label: "Pendiente",
		helper: "Lo que aún no has empezado.",
		icon: Circle,
		iconClass: "text-muted-foreground",
	},
	{
		status: "IN_PROGRESS",
		label: "En curso",
		helper: "Lo que estás trabajando ahora.",
		icon: ArrowRight,
		iconClass: "text-amber-500",
	},
	{
		status: "DONE",
		label: "Hecho",
		helper: "Lo que ya cerraste.",
		icon: Check,
		iconClass: "text-emerald-500",
	},
];

/**
 * Tablero kanban persistente del user. Las tarjetas viven a nivel user, no
 * por sesión — sobreviven entre sesiones de estudio. 3 columnas fijas: sin
 * configuración para evitar parálisis y mantener la filosofía Zen de
 * Solarium.
 */
export function KanbanBoard({ sessionId, initialCards }: Props) {
	// State local optimista. El server confirma via revalidatePath, pero
	// pintamos los cambios al instante para no notar el round-trip durante
	// la sesión.
	const [cards, setCards] = useState<Card[]>(initialCards);

	function applyOptimistic(updater: (prev: Card[]) => Card[]) {
		setCards(updater);
	}

	return (
		<div className="flex h-full w-full overflow-auto bg-background">
			<div className="grid w-full grid-cols-1 gap-4 p-6 md:grid-cols-3">
				{COLUMNS.map((col) => (
					<Column
						key={col.status}
						sessionId={sessionId}
						config={col}
						cards={cards.filter((c) => c.status === col.status)}
						applyOptimistic={applyOptimistic}
					/>
				))}
			</div>
		</div>
	);
}

function Column({
	sessionId,
	config,
	cards,
	applyOptimistic,
}: {
	sessionId: string;
	config: ColumnConfig;
	cards: Card[];
	applyOptimistic: (updater: (prev: Card[]) => Card[]) => void;
}) {
	const [isAdding, setIsAdding] = useState(false);
	const [draft, setDraft] = useState("");
	const [, startTransition] = useTransition();
	const Icon = config.icon;

	function handleAdd() {
		const title = draft.trim();
		if (!title) {
			setIsAdding(false);
			setDraft("");
			return;
		}

		// Optimismo: añadimos una tarjeta provisional con id temporal. El
		// server devuelve la real con id de Prisma; sustituimos.
		const tempId = `temp-${Date.now()}`;
		const optimisticCard: Card = {
			id: tempId,
			title,
			status: config.status,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		applyOptimistic((prev) => [optimisticCard, ...prev]);
		setDraft("");
		setIsAdding(false);

		startTransition(async () => {
			try {
				const real = await createKanbanCardAction(sessionId, title, config.status);
				if (!real) {
					applyOptimistic((prev) => prev.filter((c) => c.id !== tempId));
					toast.error("No se pudo crear la tarjeta");
					return;
				}
				applyOptimistic((prev) =>
					prev.map((c) => (c.id === tempId ? (real as Card) : c)),
				);
			} catch (err) {
				console.error("createKanbanCardAction failed", err);
				applyOptimistic((prev) => prev.filter((c) => c.id !== tempId));
				toast.error("No se pudo crear la tarjeta");
			}
		});
	}

	return (
		<section className="flex flex-col gap-3 rounded-xl border bg-card/30 p-3">
			<header className="flex items-center justify-between px-1">
				<div className="flex items-center gap-2">
					<Icon className={`size-4 ${config.iconClass}`} />
					<h3 className="text-sm font-semibold">{config.label}</h3>
					<span className="text-xs font-medium tabular-nums text-muted-foreground">
						{cards.length}
					</span>
				</div>
				<button
					type="button"
					onClick={() => setIsAdding((v) => !v)}
					className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					aria-label={`Añadir tarjeta a ${config.label}`}
				>
					<Plus className="size-4" />
				</button>
			</header>

			{isAdding && (
				<div className="rounded-lg border bg-background p-2">
					<input
						type="text"
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleAdd();
							if (e.key === "Escape") {
								setIsAdding(false);
								setDraft("");
							}
						}}
						onBlur={handleAdd}
						autoFocus
						placeholder="Nueva tarjeta..."
						maxLength={200}
						className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
					/>
				</div>
			)}

			{cards.length === 0 && !isAdding && (
				<p className="px-1 py-6 text-center text-xs text-muted-foreground/70">
					{config.helper}
				</p>
			)}

			<div className="flex flex-col gap-2">
				{cards.map((card) => (
					<CardItem
						key={card.id}
						card={card}
						applyOptimistic={applyOptimistic}
					/>
				))}
			</div>
		</section>
	);
}

function CardItem({
	card,
	applyOptimistic,
}: {
	card: Card;
	applyOptimistic: (updater: (prev: Card[]) => Card[]) => void;
}) {
	const confirm = useConfirm();
	const [isEditing, setIsEditing] = useState(false);
	const [draft, setDraft] = useState(card.title);
	const [, startTransition] = useTransition();
	const isTemp = card.id.startsWith("temp-");

	function commitRename() {
		const next = draft.trim();
		if (!next || next === card.title) {
			setDraft(card.title);
			setIsEditing(false);
			return;
		}

		applyOptimistic((prev) =>
			prev.map((c) => (c.id === card.id ? { ...c, title: next } : c)),
		);
		setIsEditing(false);

		startTransition(async () => {
			try {
				const result = await renameKanbanCardAction(card.id, next);
				if (!result) {
					applyOptimistic((prev) =>
						prev.map((c) => (c.id === card.id ? { ...c, title: card.title } : c)),
					);
					toast.error("No se pudo renombrar");
				}
			} catch (err) {
				console.error("renameKanbanCardAction failed", err);
				applyOptimistic((prev) =>
					prev.map((c) => (c.id === card.id ? { ...c, title: card.title } : c)),
				);
				toast.error("No se pudo renombrar");
			}
		});
	}

	function handleMove(target: KanbanStatus) {
		if (target === card.status) return;
		const original = card.status;
		applyOptimistic((prev) =>
			prev.map((c) => (c.id === card.id ? { ...c, status: target } : c)),
		);

		startTransition(async () => {
			try {
				const result = await moveKanbanCardAction(card.id, target);
				if (!result) {
					applyOptimistic((prev) =>
						prev.map((c) =>
							c.id === card.id ? { ...c, status: original } : c,
						),
					);
					toast.error("No se pudo mover");
				}
			} catch (err) {
				console.error("moveKanbanCardAction failed", err);
				applyOptimistic((prev) =>
					prev.map((c) => (c.id === card.id ? { ...c, status: original } : c)),
				);
				toast.error("No se pudo mover");
			}
		});
	}

	async function handleDelete() {
		const ok = await confirm({
			title: "¿Eliminar tarjeta?",
			description: "Se perderá para siempre. Esta acción no se puede deshacer.",
			confirmLabel: "Eliminar",
			destructive: true,
		});
		if (!ok) return;

		const snapshot = card;
		applyOptimistic((prev) => prev.filter((c) => c.id !== card.id));

		startTransition(async () => {
			try {
				await deleteKanbanCardAction(card.id);
				toast.success("Tarjeta eliminada");
			} catch (err) {
				console.error("deleteKanbanCardAction failed", err);
				applyOptimistic((prev) => [...prev, snapshot]);
				toast.error("No se pudo eliminar");
			}
		});
	}

	const moveTargets = COLUMNS.filter((c) => c.status !== card.status);

	return (
		<div
			className={`group flex items-start gap-2 rounded-lg border bg-background p-3 transition-colors ${
				card.status === "DONE" ? "opacity-70" : ""
			}`}
		>
			<div className="min-w-0 flex-1">
				{isEditing ? (
					<input
						type="text"
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						onBlur={commitRename}
						onKeyDown={(e) => {
							if (e.key === "Enter") commitRename();
							if (e.key === "Escape") {
								setDraft(card.title);
								setIsEditing(false);
							}
						}}
						autoFocus
						maxLength={200}
						className="w-full bg-transparent text-sm outline-none"
					/>
				) : (
					<p
						className={`break-words text-sm leading-snug ${
							card.status === "DONE" ? "line-through" : ""
						}`}
					>
						{card.title}
					</p>
				)}
			</div>

			{!isTemp && (
				<DropdownMenu>
					<DropdownMenuTrigger
						className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 data-[state=open]:opacity-100"
						aria-label="Opciones de tarjeta"
					>
						<MoreHorizontal className="size-4" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => setIsEditing(true)}>
							<Pencil className="size-4" />
							Renombrar
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						{moveTargets.map((target) => {
							const TargetIcon = target.icon;
							return (
								<DropdownMenuItem
									key={target.status}
									onClick={() => handleMove(target.status)}
								>
									<TargetIcon className={`size-4 ${target.iconClass}`} />
									Mover a {target.label}
								</DropdownMenuItem>
							);
						})}
						<DropdownMenuSeparator />
						<DropdownMenuItem variant="destructive" onClick={handleDelete}>
							<Trash2 className="size-4" />
							Eliminar
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	);
}
