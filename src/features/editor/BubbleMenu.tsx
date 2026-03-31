import { BubbleMenu } from "@tiptap/extension-bubble-menu";
import type { Editor } from "@tiptap/react";
import { Button } from "~/components/ui/button";
import { Bold, Italic, Code, Highlighter, Link2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { useState, useEffect, useRef } from "react";

interface BubbleMenuBarProps {
  editor: Editor;
}

export function BubbleMenuBar({ editor }: BubbleMenuBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateMenu = () => {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (hasSelection) {
        const view = editor.view;
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);

        const editorEl = view.dom.closest(".tiptap-editor");
        if (editorEl) {
          const editorRect = editorEl.getBoundingClientRect();
          setPosition({
            top: start.top - editorRect.top - 45,
            left: (start.left + end.right) / 2 - editorRect.left,
          });
        }

        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    editor.on("selectionUpdate", updateMenu);
    editor.on("blur", () => setIsVisible(false));

    return () => {
      editor.off("selectionUpdate", updateMenu);
    };
  }, [editor]);

  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-lg"
      style={{ top: position.top, left: position.left, transform: "translateX(-50%)" }}
    >
      <BubbleButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      >
        <Bold className="h-3.5 w-3.5" />
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      >
        <Italic className="h-3.5 w-3.5" />
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
      >
        <Code className="h-3.5 w-3.5" />
      </BubbleButton>
      <BubbleButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive("highlight")}
      >
        <Highlighter className="h-3.5 w-3.5" />
      </BubbleButton>
      <BubbleButton
        onClick={() => {
          const url = window.prompt("URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        active={editor.isActive("link")}
      >
        <Link2 className="h-3.5 w-3.5" />
      </BubbleButton>
    </div>
  );
}

function BubbleButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      className={cn("h-7 w-7", active && "bg-accent")}
    >
      {children}
    </Button>
  );
}
