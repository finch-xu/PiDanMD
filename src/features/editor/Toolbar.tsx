import type { Editor } from "@tiptap/react";
import { Button } from "~/components/ui/button";
import { Tooltip } from "~/components/ui/tooltip";
import { Separator } from "~/components/ui/separator";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Minus,
  ImageIcon,
  Link2,
  Table as TableIcon,
  Highlighter,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface ToolbarProps {
  editor: Editor | null;
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const items: ToolbarItem[] = [
    {
      icon: Undo,
      title: "Undo",
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
    },
    {
      icon: Redo,
      title: "Redo",
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
    },
    { type: "separator" },
    {
      icon: Heading1,
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: Heading2,
      title: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading3,
      title: "Heading 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    { type: "separator" },
    {
      icon: Bold,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      icon: Italic,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      icon: Strikethrough,
      title: "Strikethrough",
      action: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
    },
    {
      icon: Code,
      title: "Code",
      action: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive("code"),
    },
    {
      icon: Highlighter,
      title: "Highlight",
      action: () => editor.chain().focus().toggleHighlight().run(),
      active: editor.isActive("highlight"),
    },
    { type: "separator" },
    {
      icon: List,
      title: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      title: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      icon: ListChecks,
      title: "Task List",
      action: () => editor.chain().focus().toggleTaskList().run(),
      active: editor.isActive("taskList"),
    },
    { type: "separator" },
    {
      icon: Quote,
      title: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      icon: Minus,
      title: "Horizontal Rule",
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      icon: Link2,
      title: "Link",
      action: () => {
        const url = window.prompt("URL");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      active: editor.isActive("link"),
    },
    {
      icon: ImageIcon,
      title: "Image",
      action: () => {
        const url = window.prompt("Image URL");
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
    },
    {
      icon: TableIcon,
      title: "Table",
      action: () =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
  ];

  return (
    <div className="flex items-center gap-0.5 border-b px-2 py-1 overflow-x-auto">
      {items.map((item, i) => {
        if ("type" in item && item.type === "separator") {
          return <Separator key={i} orientation="vertical" className="mx-1 h-5" />;
        }
        const btn = item as ToolbarButton;
        return (
          <Tooltip key={i} content={btn.title}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={btn.action}
              disabled={btn.disabled}
              className={cn(btn.active && "bg-accent")}
            >
              <btn.icon className="h-4 w-4" />
            </Button>
          </Tooltip>
        );
      })}
    </div>
  );
}

type ToolbarButton = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  action: () => void;
  active?: boolean;
  disabled?: boolean;
};

type ToolbarItem = ToolbarButton | { type: "separator" };
