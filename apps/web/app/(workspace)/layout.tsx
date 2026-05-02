import "@blocknote/mantine/style.css";
import { auth, signOut } from "@/auth";
import { Folder, Home, Inbox, LogOut, User } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
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

export default async function WorkspaceLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();
	const cookieStore = await cookies();
	const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";
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
							<SidebarMenuButton asChild>
								<Link href="/home">
									<Home />
									Inicio
								</Link>
							</SidebarMenuButton>
							<SidebarMenuButton asChild>
								<Link href="/inbox">
									<Inbox className="size-5" />
									Inbox
								</Link>
							</SidebarMenuButton>
							<SidebarMenuButton asChild>
								<Link href="/folders">
									<Folder className="size-5" />
									Carpetas
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarContent>

				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg">
								<User />
								<div className="flex flex-col">
									<span className="text-sm font-medium">
										{session?.user?.name ?? "Usuario"}
									</span>
								</div>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<form
								action={async () => {
									"use server";
									await signOut();
								}}
							>
								<SidebarMenuButton asChild>
									<button type="submit">
										<LogOut />
										<span>Cerrar sesion</span>
									</button>
								</SidebarMenuButton>
							</form>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				<header className="flex h-14 items-center gap-2 border-b px-4">
					<SidebarTrigger />
				</header>
				<main className="flex flex-1 items-center justify-center">
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
