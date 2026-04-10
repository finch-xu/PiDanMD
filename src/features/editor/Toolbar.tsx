import type { Editor } from "@tiptap/react";
import { Button } from "~/components/ui/button";
import { Tooltip } from "~/components/ui/tooltip";
import { Separator } from "~/components/ui/separator";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Superscript,
  Subscript,
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
  Sigma,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { usePromptDialog } from "~/hooks/use-prompt-dialog";

interface ToolbarProps {
  editor: Editor | null;
}

export function Toolbar({ editor }: ToolbarProps) {
  const { prompt, dialogElement } = usePromptDialog();

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
    {
      icon: Superscript,
      title: "Superscript",
      action: () => editor.chain().focus().toggleSuperscript().run(),
      active: editor.isActive("superscript"),
    },
    {
      icon: Subscript,
      title: "Subscript",
      action: () => editor.chain().focus().toggleSubscript().run(),
      active: editor.isActive("subscript"),
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
      action: async () => {
        const url = await prompt("URL", "https://");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      active: editor.isActive("link"),
    },
    {
      icon: ImageIcon,
      title: "Image",
      action: async () => {
        const url = await prompt("Image URL", "https://");
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
    },
    {
      icon: Sigma,
      title: "Math",
      action: () =>
        editor
          .chain()
          .focus()
          .insertContent({ type: "mathBlock", attrs: { latex: "E = mc^2" } })
          .run(),
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
    <>
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
      {dialogElement}
    </>
  );
}

type ToolbarButton = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  action: () => unknown;
  active?: boolean;
  disabled?: boolean;
};

type ToolbarItem = ToolbarButton | { type: "separator" };
