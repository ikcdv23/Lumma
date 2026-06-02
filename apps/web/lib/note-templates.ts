import type { PartialBlock } from "@blocknote/core";

/**
 * Plantillas de nota. Se aplican a notas recién creadas (sin contenido)
 * desde EditableNote. La estructura es la que pidió el user: framework
 * "índice → detalles → resumen → preguntas de repaso" para apuntes de
 * estudio, y variantes para otros casos comunes.
 *
 * No es schema de Prisma — son constantes en cliente/server. Si crecen,
 * habrá que migrar a tabla `Template` con plantillas por user.
 */

export type NoteTemplate = {
	id: string;
	name: string;
	description: string;
	icon: "graduation" | "book" | "lightbulb";
	blocks: PartialBlock[];
};

const study: NoteTemplate = {
	id: "study-notes",
	name: "Apuntes de estudio",
	description: "Índice, detalles, resumen y preguntas de repaso plegables (flashcards).",
	icon: "graduation",
	blocks: [
		{
			type: "heading",
			props: { level: 2 },
			content: "Ideas principales",
		},
		{ type: "bulletListItem", content: "" },
		{ type: "bulletListItem", content: "" },
		{ type: "bulletListItem", content: "" },
		{
			type: "heading",
			props: { level: 2 },
			content: "Detalles y profundización",
		},
		{ type: "paragraph", content: "" },
		{
			type: "heading",
			props: { level: 2 },
			content: "Resumen",
		},
		{ type: "paragraph", content: "" },
		{
			type: "heading",
			props: { level: 2 },
			content: "Preguntas de repaso",
		},
		// Headings toggleables = flashcards: pregunta como título, respuesta
		// dentro. El user lee la pregunta, formula mentalmente la respuesta,
		// despliega para contrastar.
		{
			type: "heading",
			props: { level: 3, isToggleable: true },
			content: "Pregunta 1",
			children: [{ type: "paragraph", content: "" }],
		},
		{
			type: "heading",
			props: { level: 3, isToggleable: true },
			content: "Pregunta 2",
			children: [{ type: "paragraph", content: "" }],
		},
		{
			type: "heading",
			props: { level: 3, isToggleable: true },
			content: "Pregunta 3",
			children: [{ type: "paragraph", content: "" }],
		},
	],
};

const reading: NoteTemplate = {
	id: "reading-summary",
	name: "Resumen de lectura",
	description: "Fuente, ideas clave, citas y reacción personal.",
	icon: "book",
	blocks: [
		{ type: "paragraph", content: "Fuente: " },
		{
			type: "heading",
			props: { level: 2 },
			content: "Ideas clave",
		},
		{ type: "bulletListItem", content: "" },
		{ type: "bulletListItem", content: "" },
		{
			type: "heading",
			props: { level: 2 },
			content: "Citas relevantes",
		},
		{ type: "quote", content: "" },
		{
			type: "heading",
			props: { level: 2 },
			content: "Mi reacción",
		},
		{ type: "paragraph", content: "" },
	],
};

const brainstorm: NoteTemplate = {
	id: "brainstorm",
	name: "Lluvia de ideas",
	description: "Problema, ideas en bruto y próximos pasos.",
	icon: "lightbulb",
	blocks: [
		{
			type: "heading",
			props: { level: 2 },
			content: "Problema o pregunta",
		},
		{ type: "paragraph", content: "" },
		{
			type: "heading",
			props: { level: 2 },
			content: "Ideas",
		},
		{ type: "bulletListItem", content: "" },
		{ type: "bulletListItem", content: "" },
		{ type: "bulletListItem", content: "" },
		{
			type: "heading",
			props: { level: 2 },
			content: "Próximos pasos",
		},
		{ type: "bulletListItem", content: "" },
		{ type: "bulletListItem", content: "" },
	],
};

export const NOTE_TEMPLATES: NoteTemplate[] = [study, reading, brainstorm];

export function findTemplateById(id: string): NoteTemplate | null {
	return NOTE_TEMPLATES.find((t) => t.id === id) ?? null;
}
