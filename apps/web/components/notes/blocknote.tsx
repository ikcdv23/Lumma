"use client";

import type { Block, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";

type NoteEditorProps = {
	initial?: PartialBlock[];
	onChange: (blocks: Block[]) => void;
	theme?: "light" | "dark";
};

export function NoteEditor({
	initial,
	onChange,
	theme = "light",
}: NoteEditorProps) {
	const editor = useCreateBlockNote({
		initialContent: initial,
	});

	return (
		<BlockNoteView
			editor={editor}
			theme={theme}
			onChange={() => onChange(editor.document)}
			className="my-4 [--bn-font-family:inherit]"
		/>
	);
}
