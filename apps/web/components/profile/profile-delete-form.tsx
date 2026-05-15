"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAccountAction } from "@/server/user/user.actions";

type State = { error?: string } | null;

async function action(_prev: State, formData: FormData): Promise<State> {
	const result = await deleteAccountAction(formData);
	return result ?? null;
}

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" variant="destructive" disabled={pending}>
			{pending ? "Eliminando..." : "Eliminar cuenta permanentemente"}
		</Button>
	);
}

export function ProfileDeleteForm({ hasPassword }: { hasPassword: boolean }) {
	const [open, setOpen] = useState(false);
	const [state, formAction] = useActionState<State, FormData>(action, null);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="destructive">Eliminar cuenta</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<div className="flex items-center gap-2">
						<AlertTriangle className="size-5 text-destructive" />
						<DialogTitle>Eliminar cuenta</DialogTitle>
					</div>
					<DialogDescription>
						Esta acción es <strong>permanente y no se puede deshacer</strong>. Se
						borrarán todas tus notas, carpetas, sesiones de estudio y feedback.
					</DialogDescription>
				</DialogHeader>

				<form action={formAction} className="flex flex-col gap-4 pt-2">
					{hasPassword && (
						<div className="flex flex-col gap-2">
							<Label htmlFor="delete-password">Contraseña actual</Label>
							<Input
								id="delete-password"
								name="password"
								type="password"
								required
								autoComplete="current-password"
							/>
						</div>
					)}

					<div className="flex flex-col gap-2">
						<Label htmlFor="delete-confirmation">
							Escribe <code className="font-mono font-semibold">ELIMINAR</code>{" "}
							para confirmar
						</Label>
						<Input
							id="delete-confirmation"
							name="confirmation"
							type="text"
							required
							autoComplete="off"
							placeholder="ELIMINAR"
						/>
					</div>

					{state?.error && (
						<p className="text-sm text-destructive">{state.error}</p>
					)}

					<DialogFooter className="gap-2">
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Cancelar
							</Button>
						</DialogClose>
						<SubmitButton />
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
