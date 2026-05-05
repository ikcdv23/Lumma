import { redirect } from "next/navigation";
import { FileText, Folder, Mail, User, KeyRound, Calendar } from "lucide-react";
import { getProfile } from "@/server/actions/user-actions";
import { ProfileNameForm } from "@/components/profile/profile-name-form";
import { ProfilePasswordForm } from "@/components/profile/profile-password-form";

export const metadata = {
	title: "Perfil",
};

function getInitials(name: string | null, email: string) {
	const source = name?.trim() || email;
	return source
		.split(/\s+/)
		.slice(0, 2)
		.map((s) => s[0]?.toUpperCase())
		.join("");
}

function formatJoined(date: Date) {
	return new Intl.DateTimeFormat("es-ES", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(date);
}

export default async function ProfilePage() {
	const profile = await getProfile();
	if (!profile) redirect("/login");

	return (
		<div className="flex flex-col gap-8 p-6 md:p-8 w-full max-w-5xl mx-auto">
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					<User className="size-7 text-primary" />
					<h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
				</div>
				<p className="text-sm text-muted-foreground">
					Gestiona tu cuenta y preferencias
				</p>
			</div>

			{/* Cabecera con avatar y datos */}
			<section className="flex items-center gap-5 rounded-xl border bg-card p-6">
				{profile.image ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={profile.image}
						alt={profile.name ?? profile.email}
						className="size-18 rounded-full object-cover"
					/>
				) : (
					<div className="flex size-18 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
						{getInitials(profile.name, profile.email)}
					</div>
				)}

				<div className="flex flex-col gap-1 min-w-0">
					<h2 className="text-xl font-semibold truncate">
						{profile.name ?? "Sin nombre"}
					</h2>
					<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
						<Mail className="size-3.5" />
						<span className="truncate">{profile.email}</span>
					</div>
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Calendar className="size-3" />
						<span>Miembro desde {formatJoined(profile.createdAt)}</span>
					</div>
				</div>
			</section>

			{/* Stats */}
			<section className="grid grid-cols-2 gap-4">
				<div className="flex items-center gap-3 rounded-xl border bg-card p-4">
					<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<FileText className="size-5" />
					</div>
					<div className="flex flex-col">
						<span className="text-2xl font-bold tabular-nums">
							{profile.stats.notesCount}
						</span>
						<span className="text-xs text-muted-foreground">
							{profile.stats.notesCount === 1 ? "Nota" : "Notas"}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-3 rounded-xl border bg-card p-4">
					<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Folder className="size-5" />
					</div>
					<div className="flex flex-col">
						<span className="text-2xl font-bold tabular-nums">
							{profile.stats.foldersCount}
						</span>
						<span className="text-xs text-muted-foreground">
							{profile.stats.foldersCount === 1 ? "Carpeta" : "Carpetas"}
						</span>
					</div>
				</div>
			</section>

			{/* Editar nombre */}
			<section className="flex flex-col gap-4 rounded-xl border bg-card p-6">
				<div className="flex flex-col gap-1">
					<h3 className="text-base font-semibold">Datos personales</h3>
					<p className="text-sm text-muted-foreground">
						Tu nombre se muestra en el sidebar y en tus posts de feedback
					</p>
				</div>
				<ProfileNameForm initialName={profile.name ?? ""} />
			</section>

			{/* Cambiar contraseña (solo si la cuenta tiene una) */}
			{profile.hasPassword ? (
				<section className="flex flex-col gap-4 rounded-xl border bg-card p-6">
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							<KeyRound className="size-4 text-muted-foreground" />
							<h3 className="text-base font-semibold">Contraseña</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Cambia la contraseña con la que accedes a Lumma
						</p>
					</div>
					<ProfilePasswordForm />
				</section>
			) : (
				<section className="flex flex-col gap-2 rounded-xl border border-dashed bg-card/50 p-6">
					<div className="flex items-center gap-2">
						<KeyRound className="size-4 text-muted-foreground" />
						<h3 className="text-base font-semibold">Contraseña</h3>
					</div>
					<p className="text-sm text-muted-foreground">
						Esta cuenta accede mediante un proveedor externo (Google), no hay contraseña que gestionar.
					</p>
				</section>
			)}
		</div>
	);
}
