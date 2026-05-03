export function formatRelative(date: Date): string {
	const diffMs = Date.now() - new Date(date).getTime();
	const diffMin = Math.floor(diffMs / 60_000);

	if (diffMin < 1) return "ahora";
	if (diffMin < 60) return `hace ${diffMin} min`;

	const diffH = Math.floor(diffMin / 60);
	if (diffH < 24) return `hace ${diffH}h`;

	const diffD = Math.floor(diffH / 24);
	if (diffD === 1) return "ayer";
	if (diffD < 30) return `hace ${diffD} días`;

	const diffMo = Math.floor(diffD / 30);
	if (diffMo < 12) return `hace ${diffMo} ${diffMo === 1 ? "mes" : "meses"}`;

	const diffY = Math.floor(diffMo / 12);
	return `hace ${diffY} ${diffY === 1 ? "año" : "años"}`;
}
