import { prisma } from "@/lib/prisma";

/**
 * Capa de datos para FeedbackPost y FeedbackVote.
 *
 * Nota: getPosts NO filtra por userId — los posts son públicos (foro de
 * comunidad). Lo que sí depende del user actual es la sub-query de votes
 * para saber si el user votó cada post.
 */

export function findAllWithVoteByUser(userId: string) {
	return prisma.feedbackPost.findMany({
		orderBy: { votes: { _count: "desc" } },
		include: {
			author: { select: { name: true } },
			_count: { select: { votes: true } },
			votes: {
				where: { userId },
				select: { userId: true },
			},
		},
	});
}

export function create(data: {
	authorId: string;
	content: string;
	rating: number;
}) {
	return prisma.feedbackPost.create({
		data: {
			content: data.content,
			rating: data.rating,
			authorId: data.authorId,
		},
	});
}

export function removeOwnPost(postId: string, authorId: string) {
	return prisma.feedbackPost.delete({
		where: { id: postId, authorId },
	});
}

export function findVote(userId: string, postId: string) {
	return prisma.feedbackVote.findUnique({
		where: { userId_postId: { userId, postId } },
	});
}

export function createVote(userId: string, postId: string) {
	return prisma.feedbackVote.create({
		data: { userId, postId },
	});
}

export function removeVote(userId: string, postId: string) {
	return prisma.feedbackVote.delete({
		where: { userId_postId: { userId, postId } },
	});
}
