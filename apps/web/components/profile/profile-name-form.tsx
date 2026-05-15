"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateNameAction } from "@/server/user/user.actions";

type State = { error?: string; success?: boolean } | null;

async function action(_prev: State, formData: FormData): Promise<State> {
	return await updateNameAction(formData);
}

function SaveButton({ disabled }: { disabled: boolean }) {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" disabled={disabled || pending}>
			{pending ? "Guardando..." : "Guardar"}
		</Button>
	);
}

export function ProfileNameForm({ initialName }: { initialName: string }) {
	const [name, setName] = useState(initialName);
	const [state, formAction] = useActionState<State, FormData>(action, null);
	const [showSaved, setShowSaved] = useState(false);

	useEffect(() => {
		if (state?.success) {
			setShowSaved(true);
			const t = setTimeout(() => setShowSaved(false), 2500);
			return () => clearTimeout(t);
		}
	}, [state]);

	const isDirty = name.trim() !== initialName.trim();

	return (
		<form action={formAction} className="flex flex-col gap-3">
			<div className="flex flex-col gap-2">
				<Label htmlFor="name">Nombre</Label>
				<Input
					id="name"
					name="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					maxLength={50}
				/>
			</div>

			<div className="flex items-center gap-3">
				<SaveButton disabled={!isDirty} />
				{showSaved && (
					<span className="flex items-center gap-1 text-sm text-emerald-600">
						<Check className="size-4" />
						Guardado
					</span>
				)}
				{state?.error && (
					<span className="text-sm text-destructive">{state.error}</span>
				)}
			</div>
		</form>
	);
}
