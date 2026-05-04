"use client";

import { useFormStatus } from "react-dom";
import { FolderPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SaveFolderButtonProps = {
	isEditing: boolean;
	disabled?: boolean;
};

export function SaveFolderButton({
	isEditing,
	disabled = false,
}: SaveFolderButtonProps) {
	const { pending } = useFormStatus();
	const isDisabled = pending || disabled;

	return (
		<Button type="submit" disabled={isDisabled}>
			{pending ? (
				<Loader2 className="size-4 animate-spin" />
			) : (
				<FolderPlus className="size-4" />
			)}
			{pending
				? isEditing
					? "Guardando..."
					: "Creando..."
				: isEditing
					? "Guardar"
					: "Crear carpeta"}
		</Button>
	);
}
