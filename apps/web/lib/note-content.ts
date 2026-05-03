/**
 * Extrae texto plano del content de una nota para mostrar como preview.
 * Soporta:
 *  - Array de bloques de BlockNote (formato moderno)
 *  - String plano (notas legacy creadas desde la quick note antes del editor rico)
 *  - {} / null / cualquier cosa rara → string vacío
 */
export function extractPreview(content: unknown, maxChars = 180): string {
	// Caso legacy
	if (typeof content === "string") {
		return content.slice(0, maxChars).trim();
	}

	if (!Array.isArray(content)) return "";

	const texts: string[] = [];

	for (const block of content) {
		if (!block || typeof block !== "object") continue;

		const inlineContent = (block as { content?: unknown }).content;
		if (!Array.isArray(inlineContent)) continue;

		for (const inline of inlineContent) {
			const piece = inline as { type?: string; text?: string };
			if (piece.type === "text" && typeof piece.text === "string") {
				texts.push(piece.text);
			}
		}

		if (texts.join(" ").length >= maxChars) break;
	}

	return texts.join(" ").slice(0, maxChars).trim();
}
