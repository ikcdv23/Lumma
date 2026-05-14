"use client";

import Link from "next/link";
import { ChevronsUpDown, LogOut, User as UserIcon } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/server/actions/auth-actions";

type Props = {
	displayName: string;
	email: string;
	avatarUrl: string | null;
};

function getInitials(name: string, email: string) {
	const source = name?.trim() || email;
	return source
		.split(/\s+/)
		.slice(0, 2)
		.map((s) => s[0]?.toUpperCase() ?? "")
		.join("");
}

export function SidebarUserMenu({ displayName, email, avatarUrl }: Props) {
	const initials = getInitials(displayName, email);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:outline-sidebar-ring"
				>
					<Avatar avatarUrl={avatarUrl} initials={initials} />
					<div className="flex flex-col min-w-0 flex-1">
						<span className="truncate text-sm font-medium">
							{displayName}
						</span>
						<span className="truncate text-xs text-muted-foreground">
							{email}
						</span>
					</div>
					<ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				side="right"
				align="end"
				sideOffset={8}
				className="w-56"
			>
				<DropdownMenuLabel className="flex items-center gap-2">
					<Avatar avatarUrl={avatarUrl} initials={initials} />
					<div className="flex flex-col min-w-0">
						<span className="truncate text-sm font-medium">
							{displayName}
						</span>
						<span className="truncate text-xs text-muted-foreground font-normal">
							{email}
						</span>
					</div>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<DropdownMenuItem asChild>
					<Link href="/profile">
						<UserIcon className="size-4" />
						Perfil
					</Link>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<form action={signOutAction}>
					<DropdownMenuItem asChild variant="destructive">
						<button type="submit" className="w-full">
							<LogOut className="size-4" />
							Cerrar sesión
						</button>
					</DropdownMenuItem>
				</form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function Avatar({
	avatarUrl,
	initials,
}: {
	avatarUrl: string | null;
	initials: string;
}) {
	if (avatarUrl) {
		return (
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={avatarUrl}
				alt=""
				className="size-8 shrink-0 rounded-full object-cover"
			/>
		);
	}
	return (
		<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
			{initials}
		</div>
	);
}
