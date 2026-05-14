"use client";

import { useState } from "react";
import { Info, Sun } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export function SolariumInfoButton() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-amber-100 hover:text-amber-700 transition-colors"
				aria-label="¿Qué es Solarium?"
			>
				<Info className="size-4" />
			</button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-md p-6">
					<DialogHeader>
						<div className="flex items-center gap-2">
							<Sun className="size-5 text-amber-500" />
							<DialogTitle>¿Qué es Solarium?</DialogTitle>
						</div>
						<DialogDescription>
							Tu espacio para sesiones de estudio enfocadas.
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-4 text-sm">
						<div className="flex flex-col gap-3">
							<Step
								number={1}
								title="Elige tu material"
								body="Carpetas, notas sueltas o una mezcla de ambas."
							/>
							<Step
								number={2}
								title="Define la duración"
								body="25, 50 o 90 minutos. Sin distracciones."
							/>
							<Step
								number={3}
								title="Empieza a estudiar"
								body="El resto del mundo se queda fuera durante la sesión."
							/>
						</div>

						<div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-muted-foreground">
							<p className="leading-relaxed">
								Cada sesión completa suma luz a tu cielo del día.
								Mantén la racha estudiando un poco cada día.
							</p>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

function Step({
	number,
	title,
	body,
}: {
	number: number;
	title: string;
	body: string;
}) {
	return (
		<div className="flex items-start gap-3">
			<div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700 tabular-nums">
				{number}
			</div>
			<div className="flex flex-col gap-0.5">
				<span className="font-medium">{title}</span>
				<span className="text-xs text-muted-foreground">{body}</span>
			</div>
		</div>
	);
}
