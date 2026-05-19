import { Inbox, NotebookPen, MessageSquare } from "lucide-react";

const features = [
	{
		icon: Inbox,
		title: "Notas rápidas",
		body: "Captura una idea en segundos desde el Inbox. Sin clasificar, sin fricción. Después la mueves donde toque.",
	},
	{
		icon: NotebookPen,
		title: "Editor rico tipo Notion",
		body: "Bloques, listas, código con syntax highlighting en 14 lenguajes, todo con autosave silencioso.",
	},
	{
		icon: MessageSquare,
		title: "Carpetas y organización",
		body: "Agrupa tus notas por temas. Mueve, renombra y organiza con un click derecho.",
	},
];

export function LandingFeatures() {
	return (
		<section className="mx-auto max-w-6xl px-6 py-24">
			<div className="mx-auto mb-14 max-w-2xl text-center">
				<h2 className="text-3xl font-bold tracking-tight md:text-4xl">
					Todo lo que necesitas para estudiar
				</h2>
				<p className="mt-4 text-muted-foreground">
					Sin sobrecargar de funciones. Lo justo para que el conocimiento
					fluya y se quede.
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				{features.map((feature) => {
					const Icon = feature.icon;
					return (
						<div
							key={feature.title}
							className="flex flex-col gap-4 rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md"
						>
							<div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<Icon className="size-5" />
							</div>
							<div className="flex flex-col gap-1.5">
								<h3 className="text-lg font-semibold tracking-tight">
									{feature.title}
								</h3>
								<p className="text-sm leading-relaxed text-muted-foreground">
									{feature.body}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
