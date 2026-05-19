"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useConfirm } from "@/components/confirm/confirm-provider";
import { deleteFeedbackPostAction } from "@/server/feedback/feedback.actions";

export function DeleteFeedbackButton({ postId }: { postId: string }) {
	const confirm = useConfirm();
	const [pending, startTransition] = useTransition();

	async function handleClick() {
		const ok = await confirm({
			title: "¿Eliminar este feedback?",
			description:
				"Se perderán también los votos que haya recibido. Esta acción no se puede deshacer.",
			confirmLabel: "Eliminar",
			destructive: true,
		});
		if (!ok) return;

		startTransition(async () => {
			await deleteFeedbackPostAction(postId);
		});
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={pending}
			aria-label="Eliminar post"
			className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
		>
			<Trash2 className="size-4" />
		</button>
	);
}
