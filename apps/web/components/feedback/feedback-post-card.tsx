import { Trash2 } from "lucide-react";
import { StarRating } from "./star-rating";
import { VoteButton } from "./vote-button";
import { formatRelative } from "@/lib/format-date";
import {
	deleteFeedbackPostAction,
	toggleFeedbackVoteAction,
} from "@/server/feedback/feedback.actions";

type FeedbackPostCardProps = {
	post: {
		id: string;
		content: string;
		rating: number;
		createdAt: Date;
		authorId: string;
		author: { name: string | null };
		_count: { votes: number };
		votes: { userId: string }[];
	};
	isAuthor: boolean;
};

export function FeedbackPostCard({ post, isAuthor }: FeedbackPostCardProps) {
	const voted = post.votes.length > 0;

	return (
		<article className="flex flex-col gap-3 rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm">
			<header className="flex items-start justify-between gap-3">
				<div className="flex flex-col gap-0.5 min-w-0">
					<span className="text-sm font-medium truncate">
						{post.author.name ?? "Anónimo"}
					</span>
					<span className="text-xs text-muted-foreground tabular-nums">
						{formatRelative(post.createdAt)}
					</span>
				</div>
				<StarRating value={post.rating} size="sm" />
			</header>

			<p className="text-sm leading-relaxed whitespace-pre-wrap">
				{post.content}
			</p>

			<footer className="flex items-center justify-between">
				<form
					action={async () => {
						"use server";
						await toggleFeedbackVoteAction(post.id);
					}}
				>
					<VoteButton count={post._count.votes} voted={voted} />
				</form>

				{isAuthor && (
					<form
						action={async () => {
							"use server";
							await deleteFeedbackPostAction(post.id);
						}}
					>
						<button
							type="submit"
							className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
							aria-label="Eliminar post"
						>
							<Trash2 className="size-4" />
						</button>
					</form>
				)}
			</footer>
		</article>
	);
}
