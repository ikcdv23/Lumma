import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sun } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SessionConfig } from "@/components/solarium/session-config";

export const metadata = {
	title: "Nueva sesión · Solarium",
};

export default async function NewSessionPage() {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");

	const userId = session.user.id;

	const [folders, notes] = await Promise.all([
		prisma.folder.findMany({
			where: { userId },
			select: {
				id: true,
				name: true,
				_count: { select: { notes: true } },
				notes: {
					select: { id: true, title: true },
					orderBy: { updatedAt: "desc" },
				},
			},
			orderBy: { name: "asc" },
		}),
		prisma.note.findMany({
			where: {
				userId,
				folder: null
			},
			select: {
				id: true,
				title: true,
				folder: { select: { name: true } },
			},
			orderBy: { updatedAt: "desc" },
			take: 50,
		}),
	]);

	return (
		<div className="flex flex-col gap-8 p-6 md:p-8 w-full max-w-5xl mx-auto">
			{/* Back link */}
			<Link
				href="/solarium"
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
			>
				<ArrowLeft className="size-4" />
				Volver a Solarium
			</Link>

			{/* Header */}
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					<Sun className="size-7 text-amber-500" />
					<h1 className="text-3xl font-bold tracking-tight">
						Configura tu sesión
					</h1>
				</div>
				<p className="text-sm text-muted-foreground">
					Elige tu material y duración. Cuando empieces, te quedarás concentrado
					hasta el final.
				</p>
			</div>

			<SessionConfig folders={folders} notes={notes} />
		</div>
	);
}
