import "@blocknote/mantine/style.css";
import { auth, signOut } from "@/auth";
import { Folder, Home, Inbox, LogOut, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { NotesSearch } from "@/components/notes/notes-search"
import { prisma } from "@/lib/prisma";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { sidebarMenuButtonVariants } from "@/components/ui/sidebar-variants";

export default async function WorkspaceLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();
	const cookieStore = await cookies();
	const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";

	// Leer nombre fresco de la BD (el JWT no se actualiza al cambiar el perfil)
	const dbUser = session?.user?.id
		? await prisma.user.findUnique({
				where: { id: session.user.id },
				select: { name: true },
			})
		: null;
	const displayName = dbUser?.name ?? session?.user?.name ?? "Usuario";
	return (
		<SidebarProvider defaultOpen={sidebarOpen}>
			<Sidebar variant="inset" suppressHydrationWarning>
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg">
								<span className="text-lg font-bold">Lumma</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>

				<SidebarContent>
					<SidebarMenu>

						<SidebarMenuItem>
							<Link href="/home" className={sidebarMenuButtonVariants()}>
								<Home />
								Inicio
							</Link>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<Link href="/inbox" className={sidebarMenuButtonVariants()}>
								<Inbox className="size-5" />
								Inbox
							</Link>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<Link href="/folders" className={sidebarMenuButtonVariants()}>
								<Folder className="size-5" />
								Carpetas
							</Link>
						</SidebarMenuItem>

					</SidebarMenu>
				</SidebarContent>

				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<Link href="/feedback" className={sidebarMenuButtonVariants()}>
								<MessageSquare className="size-5" />
								<span className="text-muted-foreground">Feedback</span>
							</Link>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<Link
								href="/profile"
								className={sidebarMenuButtonVariants({ size: "lg" })}
							>
								<User />
								<div className="flex flex-col">
									<span className="text-sm font-medium">
										{displayName}
									</span>
								</div>
							</Link>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<form
								action={async () => {
									"use server";
									await signOut({ redirectTo: "/login" });
								}}
							>
								<button type="submit" className={sidebarMenuButtonVariants()}>
									<LogOut />
									<span>Cerrar sesion</span>
								</button>
							</form>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				<header className="flex h-14 items-center gap-2 border-b px-4">
					<SidebarTrigger />
					<div className="flex flex-1 justify-center">
						<NotesSearch />
					</div>
				</header>	
				<main className="flex flex-1 items-center justify-center">

					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
