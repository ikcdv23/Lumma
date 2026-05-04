"use client";

import { useFormStatus } from "react-dom";
import { FilePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type NewNoteButtonProps = {
	variant?: "default" | "outline";
};

export function NewNoteButton({ variant = "default" }: NewNoteButtonProps) {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" variant={variant} disabled={pending}>
			{pending ? (
				<Loader2 className="size-4 animate-spin" />
			) : (
				<FilePlus className="size-4" />
			)}
			{pending ? "Creando..." : "Nueva nota"}
		</Button>
	);
}
