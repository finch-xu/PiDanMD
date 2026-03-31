import { useEffect } from "react";
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
import { useEditorStore } from "~/stores/editor-store";
import { useT } from "~/lib/i18n";
import { Toolbar } from "./Toolbar";
import { BubbleMenuBar } from "./BubbleMenu";
import "~/styles/editor.css";

export function Editor() {
  const t = useT();
  const content = useEditorStore((s) => s.content);
  const filePath = useEditorStore((s) => s.filePath);
  const isLoading = useEditorStore((s) => s.isLoading);
  const setContent = useEditorStore((s) => s.setContent);

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
      Markdown,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const md = (editor.storage.markdown as { getMarkdown?: () => string })?.getMarkdown?.() ?? editor.getText();
      setContent(md);
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
  });

  // When a new file is loaded, update editor content
  useEffect(() => {
    if (editor && filePath && !isLoading) {
      editor.commands.setContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, filePath]);

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

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
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
