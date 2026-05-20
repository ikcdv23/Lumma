"use client";

import { useState } from "react";
import { Sun } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/loaders";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	targetMinutes: number;
	extraMinutes: number;
	pending: boolean;
	onConfirm: (reflection: string | null) => void;
};

export function CompletionModal({
	open,
	onOpenChange,
	targetMinutes,
	extraMinutes,
	pending,
	onConfirm,
}: Props) {
	const [reflection, setReflection] = useState("");
	const total = targetMinutes + extraMinutes;

	function handleConfirm() {
		const trimmed = reflection.trim();
		onConfirm(trimmed.length > 0 ? trimmed : null);
	}

	return (
		<Dialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-linear-to-br from-amber-300 to-orange-400 shadow-md shadow-amber-500/30">
						<Sun
							className="size-7 text-white"
							strokeWidth={2}
							fill="currentColor"
						/>
					</div>
					<DialogTitle className="text-center text-xl">
						Tu sol se ha puesto
					</DialogTitle>
					<DialogDescription className="text-center text-sm">
						Has estudiado{" "}
						<strong className="text-foreground tabular-nums">
							{total} {total === 1 ? "minuto" : "minutos"}
						</strong>
						{extraMinutes > 0 && (
							<>
								{" "}
								<span className="text-muted-foreground">
									({targetMinutes} de objetivo + {extraMinutes} extra)
								</span>
							</>
						)}
						.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-2 pt-2">
					<label
						htmlFor="reflection"
						className="text-sm font-medium text-foreground"
					>
						¿Qué has aprendido?{" "}
						<span className="font-normal text-muted-foreground">
							(opcional)
						</span>
					</label>
					<textarea
						id="reflection"
						value={reflection}
						onChange={(e) => setReflection(e.target.value)}
						placeholder="Una idea, una pregunta, un avance..."
						rows={3}
						disabled={pending}
						className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
					/>
					<p className="text-xs text-muted-foreground">
						Tu reflexión queda guardada con la sesión. La puedes consultar
						después.
					</p>
				</div>

				<DialogFooter className="gap-2 sm:gap-2">
					<Button
						type="button"
						variant="ghost"
						onClick={() => onOpenChange(false)}
						disabled={pending}
					>
						Quedarme un poco más
					</Button>
					<Button
						type="button"
						onClick={handleConfirm}
						disabled={pending}
						className="bg-amber-500 hover:bg-amber-600 text-white"
					>
						{pending ? (
							<>
								<Spinner
									size="sm"
									className="border-white border-t-transparent"
								/>
								Cerrando
							</>
						) : (
							"Cerrar la jornada"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
