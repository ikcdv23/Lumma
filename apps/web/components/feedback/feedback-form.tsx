"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StarRating } from "./star-rating";
import { createFeedbackPostAction } from "@/server/feedback/feedback.actions";

function SubmitButton({ disabled }: { disabled: boolean }) {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" disabled={pending || disabled}>
			{pending ? (
				<Loader2 className="size-4 animate-spin" />
			) : (
				<Send className="size-4" />
			)}
			{pending ? "Publicando..." : "Publicar"}
		</Button>
	);
}

export function FeedbackForm() {
	const [content, setContent] = useState("");
	const [rating, setRating] = useState(0);

	async function handleSubmit() {
		if (!content.trim() || rating === 0) return;
		try {
			const created = await createFeedbackPostAction(content.trim(), rating);
			if (!created) {
				toast.error("No se pudo publicar el feedback");
				return;
			}
			toast.success("Feedback publicado", {
				description: "Gracias por compartir tu opinión.",
			});
			setContent("");
			setRating(0);
		} catch (err) {
			console.error("createFeedbackPostAction failed", err);
			toast.error("No se pudo publicar el feedback");
		}
	}

	const isInvalid = content.trim() === "" || rating === 0;

	return (
		<form
			action={handleSubmit}
			className="flex flex-col gap-4 rounded-xl border bg-card p-5"
		>
			<textarea
				placeholder="Comparte tu opinión, reporta un bug o sugiere una mejora..."
				value={content}
				onChange={(e) => setContent(e.target.value)}
				rows={3}
				maxLength={2000}
				className="w-full bg-transparent text-sm leading-relaxed resize-none outline-none placeholder:text-muted-foreground"
			/>
			<div className="flex items-center justify-between gap-3 flex-wrap">
				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground">
						Tu valoración:
					</span>
					<StarRating value={rating} onChange={setRating} />
				</div>
				<SubmitButton disabled={isInvalid} />
			</div>
		</form>
	);
}
