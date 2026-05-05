"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/server/actions/user-actions";

type State = { error?: string; success?: boolean } | null;

async function action(_prev: State, formData: FormData): Promise<State> {
	return await updatePassword(formData);
}

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" disabled={pending}>
			{pending ? "Cambiando..." : "Cambiar contraseña"}
		</Button>
	);
}

export function ProfilePasswordForm() {
	const [state, formAction] = useActionState<State, FormData>(action, null);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (state?.success) formRef.current?.reset();
	}, [state]);

	return (
		<form ref={formRef} action={formAction} className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<Label htmlFor="currentPassword">Contraseña actual</Label>
				<Input
					id="currentPassword"
					name="currentPassword"
					type="password"
					required
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="newPassword">Nueva contraseña</Label>
				<Input
					id="newPassword"
					name="newPassword"
					type="password"
					minLength={8}
					required
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
				<Input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					minLength={8}
					required
				/>
			</div>

			<div className="flex items-center gap-3">
				<SubmitButton />
				{state?.success && (
					<span className="flex items-center gap-1 text-sm text-emerald-600">
						<Check className="size-4" />
						Contraseña actualizada
					</span>
				)}
				{state?.error && (
					<span className="text-sm text-destructive">{state.error}</span>
				)}
			</div>
		</form>
	);
}
