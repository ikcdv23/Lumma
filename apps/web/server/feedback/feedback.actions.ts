"use server";

import { revalidatePath } from "next/cache";
import { getAuthedUserId } from "@/lib/auth-helper";
import * as feedbackService from "./feedback.service";

export async function createFeedbackPostAction(
	content: string,
	rating: number,
) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	const post = await feedbackService.createPost(userId, content, rating);
	if (!post) return null;

	revalidatePath("/feedback");
	return post;
}

export async function deleteFeedbackPostAction(postId: string) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	const post = await feedbackService.deleteOwnPost(userId, postId);
	revalidatePath("/feedback");
	return post;
}

export async function toggleFeedbackVoteAction(postId: string) {
	const userId = await getAuthedUserId();
	if (!userId) return null;

	await feedbackService.toggleVote(userId, postId);
	revalidatePath("/feedback");
}
