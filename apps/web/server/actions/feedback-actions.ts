"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFeedbackPost(content: string, rating: number) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const post = await prisma.feedbackPost.create({
        data: {
            content,
            rating,
            authorId: session.user.id,
        },
    });

    revalidatePath("/feedback");
    return post;
}

export async function deleteFeedbackPost(postId: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const post = await prisma.feedbackPost.delete({
        where: {
            id: postId,
            authorId: session.user.id,
        },
    });

    revalidatePath("/feedback");
    return post;
}

export async function getFeedbackPosts() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.feedbackPost.findMany({
        orderBy: { votes: { _count: "desc" } },
        include: {
            author: { select: { name: true } },
            _count: { select: { votes: true } },
            votes: {
                where: { userId: session.user.id },
                select: { userId: true },
            },
        },
    });
}

export async function toggleFeedbackVote(postId: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const existing = await prisma.feedbackVote.findUnique({
        where: {
            userId_postId: {
                userId: session.user.id,
                postId,
            },
        },
    });

    if (existing) {
        await prisma.feedbackVote.delete({
            where: {
                userId_postId: {
                    userId: session.user.id,
                    postId,
                },
            },
        });
    } else {
        await prisma.feedbackVote.create({
            data: {
                userId: session.user.id,
                postId,
            },
        });
    }

    revalidatePath("/feedback");
}