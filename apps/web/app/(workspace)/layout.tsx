import "@blocknote/mantine/style.css";
import { auth } from "@/auth";
import {
	ChevronDown,
	Folder,
	Home,
	Inbox,
	MessageSquare,
	Sparkles,
	Sun,
} from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { NotesSearch } from "@/components/notes/notes-search";
import { SidebarMobileAutoClose } from "@/components/sidebar-mobile-auto-close";
import { SidebarUserMenu } from "@/components/sidebar-user-menu";
import { prisma } from "@/lib/prisma";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	sidebarMenuButtonVariants,
	sidebarMenuSubButtonVariants,
} from "@/components/ui/sidebar-variants";

export default async function WorkspaceLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();
	const cookieStore = await cookies();
	const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";

	// Leer datos frescos de la BD (el JWT no se actualiza al cambiar perfil)
	const dbUser = session?.user?.id
		? await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { name: true, image: true, email: true },
		})
		: null;
	const displayName = dbUser?.name ?? session?.user?.name ?? "Usuario";
	const email = dbUser?.email ?? session?.user?.email ?? "";
	const avatarUrl = dbUser?.image ?? session?.user?.image ?? null;

	return (
		<SidebarProvider defaultOpen={sidebarOpen}>
			<SidebarMobileAutoClose />
			<Sidebar variant="inset" suppressHydrationWarning>
				{/* HEADER — Brand */}
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<div className="flex items-center gap-2.5 px-2 py-3">
								<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-amber-300 to-amber-500 shadow-sm">
									<Sparkles
										className="size-4 text-amber-50"
										fill="currentColor"
										strokeWidth={2}
									/>
								</div>
								<div className="flex flex-col min-w-0">
									<span className="text-base font-bold leading-tight tracking-tight">
										Lumma
									</span>
									<span className="text-[10px] uppercase tracking-wider text-muted-foreground">
										Notas y estudio
									</span>
								</div>
							</div>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>

				{/* CONTENT — navegación */}
				<SidebarContent>
					{/* Grupo principal */}
					<SidebarGroup>
						<SidebarMenu>
							<SidebarMenuItem>
								<Link
									href="/home"
									className={sidebarMenuButtonVariants()}
								>
									<Home className="size-4" />
									Inicio
								</Link>
							</SidebarMenuItem>

							<SidebarMenuItem>
								<Link
									href="/inbox"
									className={sidebarMenuButtonVariants()}
								>
									<Inbox className="size-4" />
									Inbox
								</Link>
							</SidebarMenuItem>

							<SidebarMenuItem>
								<Link
									href="/folders"
									className={sidebarMenuButtonVariants()}
								>
									<Folder className="size-4" />
									Carpetas
								</Link>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>

					{/* Grupo herramientas (colapsable) */}
					<SidebarGroup>
						<SidebarGroupLabel>Herramientas</SidebarGroupLabel>
						<SidebarMenu>
							<Collapsible className="group/study">
								<SidebarMenuItem>
									<CollapsibleTrigger
										className={sidebarMenuButtonVariants()}
									>
										Área de estudio
										<ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/study:rotate-180" />
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											<SidebarMenuSubItem>

												<Link
													href="/solarium"
													className={sidebarMenuSubButtonVariants()}
												><Sun className="size-4" />
													Solario
												</Link>
											</SidebarMenuSubItem>
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						</SidebarMenu>
					</SidebarGroup>

				</SidebarContent>

				{/* FOOTER — feedback + user dropdown */}
				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<Link
								href="/feedback"
								className={sidebarMenuButtonVariants()}
							>
								<MessageSquare className="size-4" />
								<span className="text-muted-foreground">Feedback</span>
							</Link>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarUserMenu
								displayName={displayName}
								email={email}
								avatarUrl={avatarUrl}
							/>
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
