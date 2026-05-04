import { MessageSquare } from "lucide-react";
import { auth } from "@/auth";
import { getFeedbackPosts } from "@/server/actions/feedback-actions";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { FeedbackPostCard } from "@/components/feedback/feedback-post-card";

export const metadata = {
	title: "Feedback",
};

export default async function FeedbackPage() {
	const session = await auth();
	const userId = session?.user?.id ?? "";
	const posts = await getFeedbackPosts();
	const isEmpty = posts.length === 0;

	return (
		<div className="flex flex-col gap-6 p-6 md:p-8 w-full max-w-5xl mx-auto">
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					<MessageSquare className="size-7 text-primary" />
					<h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
				</div>
				<p className="text-sm text-muted-foreground">
					Lumma está en desarrollo activo.
					Comparte tus ideas, reporta bugs o vota lo que más te interesa, tu opinión es importante.
				</p>
			</div>

			<FeedbackForm />

			{isEmpty ? (
				<div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 px-6 text-center">
					<div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
						<MessageSquare className="size-8" />
					</div>
					<div className="flex flex-col gap-1">
						<h3 className="text-lg font-semibold">Aún no hay opiniones</h3>
						<p className="text-sm text-muted-foreground max-w-xs">
							Sé el primero en compartir qué te parece Lumma
						</p>
					</div>
				</div>
			) : (
				<div className="flex flex-col gap-3">
					{posts.map((post) => (
						<FeedbackPostCard
							key={post.id}
							post={post}
							isAuthor={post.authorId === userId}
						/>
					))}
				</div>
			)}
		</div>
	);
}
