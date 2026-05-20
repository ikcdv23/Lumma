"use client";

import { useEffect } from "react";
import {
	BlockNoteSchema,
	createCodeBlockSpec,
	defaultBlockSpecs,
	type Block,
	type PartialBlock,
} from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { createHighlighter } from "shiki";

type NoteEditorProps = {
	initial?: PartialBlock[];
	onChange: (blocks: Block[]) => void;
	theme?: "light" | "dark";
};

const SUPPORTED_LANGS = [
	"typescript",
	"javascript",
	"python",
	"java",
	"c",
	"cpp",
	"csharp",
	"php",
	"bash",
	"json",
	"css",
	"html",
	"sql",
	"markdown",
] as const;

const schema = BlockNoteSchema.create({
	blockSpecs: {
		...defaultBlockSpecs,
		codeBlock: createCodeBlockSpec({
			indentLineWithTab: true,
			defaultLanguage: "typescript",
			supportedLanguages: {
				typescript: { name: "TypeScript", aliases: ["ts"] },
				javascript: { name: "JavaScript", aliases: ["js"] },
				python: { name: "Python", aliases: ["py"] },
				java: { name: "Java" },
				c: { name: "C" },
				cpp: { name: "C++", aliases: ["c++"] },
				csharp: { name: "C#", aliases: ["cs", "c#"] },
				php: { name: "PHP" },
				bash: { name: "Bash", aliases: ["sh"] },
				json: { name: "JSON" },
				css: { name: "CSS" },
				html: { name: "HTML" },
				sql: { name: "SQL" },
				markdown: { name: "Markdown", aliases: ["md"] },
			},
			createHighlighter: () =>
				createHighlighter({
					themes: ["github-light", "github-dark"],
					langs: [...SUPPORTED_LANGS],
				}),
		}),
	},
});

export function NoteEditor({
	initial,
	onChange,
	theme = "light",
}: NoteEditorProps) {
	const editor = useCreateBlockNote({
		schema,
		initialContent: initial,
	});

	useEffect(() => {
		const dom = editor.domElement;
		if (!dom) return;

		const handlePaste = async (e: ClipboardEvent) => {
			const text = e.clipboardData?.getData("text/plain");
			if (!text) return;

			const looksLikeMarkdown = /(^#{1,6}\s)|(\n\n)|(```)|(\*\*)|(^\s*[-*]\s)|(^\s*\d+\.\s)|(\|.*\|)/m.test(text);
			if (!looksLikeMarkdown) return;

			e.preventDefault();
			const blocks = await editor.tryParseMarkdownToBlocks(text);
			editor.replaceBlocks([editor.getTextCursorPosition().block.id], blocks);
		};

		dom.addEventListener("paste", handlePaste);
		return () => dom.removeEventListener("paste", handlePaste);
	}, [editor]);

	return (
		<BlockNoteView
			editor={editor}
			theme={theme}
			onChange={() => onChange(editor.document)}
			className="my-4 [--bn-font-family:inherit]"
		/>
	);
}
