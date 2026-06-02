import * as feedbackRepository from "./feedback.repository";

export function listPosts(userId: string) {
	return feedbackRepository.findAllWithVoteByUser(userId);
}

export async function createPost(
	authorId: string,
	content: string,
	rating: number,
) {
	const trimmed = content.trim();
	if (!trimmed) return null;
	if (rating < 1 || rating > 5) return null;

	return feedbackRepository.create({
		authorId,
		content: trimmed,
		rating,
	});
}

export function deleteOwnPost(authorId: string, postId: string) {
	return feedbackRepository.removeOwnPost(postId, authorId);
}

/**
 * Toggle del voto: si el user ya votó este post, lo retira; si no, lo añade.
 * Idempotente desde el punto de vista de la UI ("voto on/off").
 *
 * Delega al repo el upsert atómico para que dos clics simultáneos no
 * dupliquen ni rompan el unique constraint.
 */
export function toggleVote(userId: string, postId: string) {
	return feedbackRepository.toggleVoteAtomic(userId, postId);
}
