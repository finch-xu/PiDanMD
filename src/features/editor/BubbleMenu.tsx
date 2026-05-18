import type { Editor } from "@tiptap/react";
import { Bold, Italic, Code, Highlighter, Link2, Strikethrough } from "lucide-react";
import { cn } from "~/lib/utils";
import { useState, useEffect, useRef } from "react";
import { usePromptDialog } from "~/hooks/use-prompt-dialog";
import { IconButton, Divider } from "~/components/ui/icon-button";

// 选中文本时浮现在选区上方的迷你工具栏（加粗/斜体/删除/代码/高亮/链接）

interface BubbleMenuBarProps {
  editor: Editor;
}

export function BubbleMenuBar({ editor }: BubbleMenuBarProps) {
  const { prompt, dialogElement } = usePromptDialog();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateMenu = () => {
      const { from, to, empty } = editor.state.selection;
      if (empty) {
        setIsVisible(false);
        return;
      }

      const view = editor.view;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      const editorEl = view.dom.closest(".tiptap-editor");
      if (editorEl) {
        const editorRect = editorEl.getBoundingClientRect();
        setPosition({
          top: start.top - editorRect.top - 48,
          left: (start.left + end.right) / 2 - editorRect.left,
        });
      }

      setIsVisible(true);
    };

    editor.on("selectionUpdate", updateMenu);
    editor.on("blur", () => setIsVisible(false));

    return () => {
      editor.off("selectionUpdate", updateMenu);
    };
  }, [editor]);

  if (!isVisible) return null;

  return (
    <>
      <div
        ref={menuRef}
        className={cn(
          "absolute z-50 flex items-center gap-0.5 rounded-xl border border-border/60 p-1",
          "bg-popover/95 backdrop-blur-md text-popover-foreground",
          "pidan-shadow-floating pidan-anim-slide"
        )}
        style={{ top: position.top, left: position.left, transform: "translateX(-50%)" }}
      >
        <IconButton
          title="加粗"
          label="加粗"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton
          title="斜体"
          label="斜体"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton
          title="删除线"
          label="删除线"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </IconButton>
        <Divider />
        <IconButton
          title="行内代码"
          label="行内代码"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton
          title="高亮"
          label="高亮"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="h-3.5 w-3.5" />
        </IconButton>
        <Divider />
        <IconButton
          title="链接"
          label="链接"
          active={editor.isActive("link")}
          onClick={async () => {
            const url = await prompt("链接 URL", "https://");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          <Link2 className="h-3.5 w-3.5" />
        </IconButton>
      </div>
      {dialogElement}
    </>
  );
}
