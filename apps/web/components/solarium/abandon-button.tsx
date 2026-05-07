"use client";

import { useState } from "react";
import Link from "next/link";
import { X, AlertTriangle } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
	minutesElapsed?: number;
	target?: number;
};

export function AbandonButton({ minutesElapsed = 12, target = 25 }: Props) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
			>
				<X className="size-3.5" />
				Abandonar
			</button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<div className="flex items-start gap-3">
							<div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive shrink-0">
								<AlertTriangle className="size-5" />
							</div>
							<div className="flex-1 min-w-0">
								<DialogTitle>¿Abandonar la sesión?</DialogTitle>
								<DialogDescription className="mt-0.5">
									Llevas {minutesElapsed} de {target} min. Esta sesión no
									contará para tu racha.
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<DialogFooter className="flex flex-row gap-2 sm:justify-end">
						<Button variant="outline" onClick={() => setOpen(false)}>
							Seguir estudiando
						</Button>
						<Button variant="destructive" asChild>
							<Link href="/sessions-mockup/result?status=failed">
								Sí, abandonar
							</Link>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
