import Link from "next/link";
import { redirect } from "next/navigation";
import { Cloud, CloudSun, Sun, Zap } from "lucide-react";


export default function RecentSessionCard({
    folder,
    duration,
    when,
}: {
    folder: string;
    duration: number;
    when: string;
}) {
    const isFull = duration >= 90;
    const isPartial = duration >= 50;

    const Icon = isFull ? Sun : isPartial ? CloudSun : Cloud;
    const iconColor = isFull
        ? "text-amber-500"
        : isPartial
            ? "text-amber-400"
            : "text-amber-300";
    const haloIntensity = isFull
        ? "opacity-100"
        : isPartial
            ? "opacity-60"
            : "opacity-30";

    return (
        <div className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
            {/* Halo de sol */}
            <div
                className={`pointer-events-none absolute -left-6 -top-6 size-24 rounded-full bg-amber-300/30 blur-2xl ${haloIntensity}`}
            />
            <div
                className={`pointer-events-none absolute -right-8 -bottom-8 size-20 rounded-full bg-amber-200/20 blur-2xl ${haloIntensity}`}
            />

            {/* Contenido */}
            <div className="relative flex items-center gap-3">
                <div className="relative flex size-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-200/50">
                    <Icon
                        className={`size-5 ${iconColor} transition-transform group-hover:scale-110`}
                        strokeWidth={2}
                        fill={isFull ? "currentColor" : "none"}
                    />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <h3 className="font-semibold text-sm truncate">{folder}</h3>
                    <p className="text-xs text-muted-foreground tabular-nums">
                        {duration} min · {when}
                    </p>
                </div>
            </div>
        </div>
    );
}
