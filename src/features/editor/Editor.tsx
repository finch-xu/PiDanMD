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
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
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
import { ColorCodePreview } from "./extensions/color-code-preview";
import { MathBlock } from "./extensions/math-block";
import { MathInline } from "./extensions/math-inline";
import { MermaidBlock } from "./extensions/mermaid-block";
import { Frontmatter } from "./extensions/frontmatter";
import { FocusParagraph, useWritingModeStore } from "~/features/writing-modes";
import { useAppStore } from "~/stores/app-store";
import { renderSuperscript, renderSubscript } from "~/lib/markdown-serde";
import { cn } from "~/lib/utils";
import "~/styles/editor.css";

const lowlight = createLowlight(common);

export function Editor() {
  const t = useT();
  const content = useEditorStore((s) => s.content);
  const filePath = useEditorStore((s) => s.filePath);
  const isLoading = useEditorStore((s) => s.isLoading);
  const editorMode = useEditorStore((s) => s.editorMode);
  const setContent = useEditorStore((s) => s.setContent);

  const typewriter = useWritingModeStore((s) => s.typewriter);
  const focusParagraph = useWritingModeStore((s) => s.focusParagraph);
  const isFullscreen = useAppStore((s) => s.isFullscreen);

  const editorClass = cn(
    "tiptap-editor",
    typewriter && "typewriter-mode",
    focusParagraph && "focus-paragraph-mode",
    isFullscreen && "immersive-mode"
  );

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
      Superscript.extend({
        renderMarkdown: (node, h) => renderSuperscript(h.renderChildren(node)),
      }),
      Subscript.extend({
        renderMarkdown: (node, h) => renderSubscript(h.renderChildren(node)),
      }),
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableCell,
      TableHeader,
      MermaidBlock,
      CodeBlockLowlight.configure({ lowlight }),
      ColorCodePreview,
      MathBlock,
      MathInline,
      Frontmatter,
      FocusParagraph,
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

    if (editorMode === "wysiwyg" || editorMode === "preview") {
      // Entering WYSIWYG or Preview: parse markdown into Tiptap
      isSyncingRef.current = true;
      editor.commands.setContent(content, { contentType: "markdown" });
      editor.setEditable(editorMode === "wysiwyg");
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

  if (editorMode === "preview") {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className={cn(editorClass, "preview-mode")}>
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Toolbar editor={editor} />
      <div className={editorClass}>
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
