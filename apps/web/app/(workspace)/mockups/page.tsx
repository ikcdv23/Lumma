import Link from "next/link";
import { LayoutGrid, List, Sparkles, Zap } from "lucide-react";

export const metadata = {
    title: "Mockups",
};

const variants = [
    {
        href: "/mockups/v1",
        icon: LayoutGrid,
        title: "V1 — Dashboard con cards",
        description:
            "Estilo dashboard. Saludo + quick capture grande arriba, secciones de notas recientes y carpetas como cards.",
    },
    {
        href: "/mockups/v2",
        icon: List,
        title: "V2 — Productividad / Compacto",
        description:
            "Dos columnas. Izquierda: lista de notas recientes con previews. Derecha: carpetas y captura rapida.",
    },
    {
        href: "/mockups/v3",
        icon: Zap,
        title: "V3 — Minimal / Quick capture",
        description:
            "Centrado en captura. Input grande tipo 'que estas pensando?'. Carpetas como chips horizontales debajo.",
    },
    {
        href: "/mockups/v4",
        icon: Sparkles,
        title: "V4 — V3 + animacion expand-to-fullscreen",
        description:
            "Igual que V3 pero la tarjeta de Nota rapida se expande a pantalla completa al click, convirtiendose en el editor. Animacion con motion (Framer Motion) usando layoutId.",
    },
];

export default function MockupsIndex() {
    return (
        <div className="flex flex-col gap-8 p-6 md:p-8 w-full max-w-4xl mx-auto">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Mockups</h1>
                <p className="text-sm text-muted-foreground">
                    Variantes de diseño para la pagina de inicio
                </p>
            </div>
            <div className="grid gap-4">
                {variants.map((v) => {
                    const Icon = v.icon;
                    return (
                        <Link
                            key={v.href}
                            href={v.href}
                            className="group flex items-start gap-4 rounded-xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                        >
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                                <Icon className="size-5" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="font-medium">{v.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {v.description}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
