import { useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Highlight } from "@tiptap/extension-highlight";
import { Typography } from "@tiptap/extension-typography";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Markdown } from "@tiptap/markdown";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useEditorStore } from "~/stores/editor-store";
import { useT } from "~/lib/i18n";
import { Toolbar } from "./Toolbar";
import { BubbleMenuBar } from "./BubbleMenu";
import { SourceEditor } from "./SourceEditor";
import "~/styles/editor.css";

const lowlight = createLowlight(common);

export function Editor() {
  const t = useT();
  const content = useEditorStore((s) => s.content);
  const filePath = useEditorStore((s) => s.filePath);
  const isLoading = useEditorStore((s) => s.isLoading);
  const editorMode = useEditorStore((s) => s.editorMode);
  const setContent = useEditorStore((s) => s.setContent);

  // Guard: prevent onUpdate from writing back to store during programmatic setContent
  const isSyncingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: t("startWriting"),
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight,
      Typography,
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
      Markdown,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      if (isSyncingRef.current) return;
      const md = editor.getMarkdown();
      setContent(md);
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
  });

  // Sync content between Tiptap and store on file load or mode switch
  useEffect(() => {
    if (!editor || !filePath || isLoading) return;

    if (editorMode === "wysiwyg") {
      // Entering WYSIWYG: parse markdown into Tiptap
      isSyncingRef.current = true;
      editor.commands.setContent(content, { contentType: "markdown" });
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
    } else {
      // Entering Source: serialize Tiptap content to markdown for source editor
      const freshMd = editor.getMarkdown();
      // Guard: never overwrite valid store content with empty Tiptap output
      if (freshMd || !content) {
        useEditorStore.setState({ content: freshMd, isDirty: false });
      }
    }
    // content intentionally excluded: onUpdate handles user typing sync
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, filePath, editorMode, isLoading]);

  const handleSourceChange = useCallback(
    (value: string) => {
      setContent(value);
    },
    [setContent]
  );

  if (!filePath) {
    return <EditorPlaceholder />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  if (editorMode === "source") {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SourceEditor content={content} onChange={handleSourceChange} />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Toolbar editor={editor} />
      <div className="tiptap-editor">
        {editor && <BubbleMenuBar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function EditorPlaceholder() {
  const t = useT();
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center text-muted-foreground">
        <p className="text-lg font-medium opacity-40">{t("appName")}</p>
        <p className="mt-2 text-sm opacity-30">{t("openFolderToStart")}</p>
      </div>
    </div>
  );
}
