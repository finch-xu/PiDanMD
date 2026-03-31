import { useState, useEffect, useCallback } from "react";
import { useEditorStore } from "~/stores/editor-store";
import { useT } from "~/lib/i18n";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { List } from "lucide-react";

interface HeadingItem {
  level: number;
  text: string;
  offset: number;
  index: number;
}

function parseHeadings(markdown: string): HeadingItem[] {
  // Strip fenced code blocks to avoid false heading matches
  const stripped = markdown.replace(/```[\s\S]*?```/g, "");
  const headings: HeadingItem[] = [];
  const regex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  let index = 0;
  while ((match = regex.exec(stripped)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].replace(/[*_`~\[\]]/g, "").trim(),
      offset: match.index,
      index: index++,
    });
  }
  return headings;
}

export function DocumentOutline() {
  const t = useT();
  const content = useEditorStore((s) => s.content);
  const filePath = useEditorStore((s) => s.filePath);
  const editorMode = useEditorStore((s) => s.editorMode);

  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Debounced heading extraction
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeadings(parseHeadings(content));
    }, 300);
    return () => clearTimeout(timer);
  }, [content]);

  // Active heading tracking via IntersectionObserver (WYSIWYG only)
  useEffect(() => {
    if (editorMode !== "wysiwyg" || headings.length === 0) return;

    // Wait a frame for DOM to settle after content update
    const raf = requestAnimationFrame(() => {
      const container = document.querySelector(".tiptap-editor");
      if (!container) return;
      const elements = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
      if (elements.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const idx = Array.from(elements).indexOf(entry.target as Element);
              if (idx !== -1) setActiveIndex(idx);
            }
          }
        },
        { root: container, rootMargin: "-10% 0px -80% 0px" }
      );

      elements.forEach((el) => observer.observe(el));
      cleanupRef = () => observer.disconnect();
    });

    let cleanupRef: (() => void) | null = null;
    return () => {
      cancelAnimationFrame(raf);
      cleanupRef?.();
    };
  }, [headings, editorMode]);

  const scrollToHeading = useCallback(
    (heading: HeadingItem) => {
      if (editorMode === "wysiwyg") {
        const container = document.querySelector(".tiptap-editor");
        if (!container) return;
        const elements = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
        const target = elements[heading.index];
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        // Source mode: find the line element by line number
        const lineNumber = content.substring(0, heading.offset).split("\n").length;
        const lines = document.querySelectorAll(".cm-editor .cm-line");
        if (lines[lineNumber - 1]) {
          lines[lineNumber - 1].scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    },
    [editorMode, content]
  );

  if (!filePath) return <EmptyPanel />;

  return (
    <div className="flex h-full flex-col overflow-hidden border-l bg-sidebar">
      {/* Header */}
      <div className="flex h-11 items-center gap-2 border-b px-3">
        <List className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-sidebar-foreground">
          {t("documentToc")}
        </span>
      </div>

      {/* Heading list */}
      <ScrollArea className="min-h-0 flex-1 px-1">
        {headings.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            {t("noHeadings")}
          </p>
        ) : (
          <div className="py-1">
            {headings.map((h) => (
              <button
                key={`${h.index}-${h.text}`}
                onClick={() => scrollToHeading(h)}
                className={cn(
                  "flex w-full items-center rounded-lg py-1.5 pr-2 text-left text-xs transition-colors",
                  activeIndex === h.index
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
                style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}
              >
                <span className="truncate">{h.text}</span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function EmptyPanel() {
  return (
    <div className="flex h-full flex-col overflow-hidden border-l bg-sidebar">
      <div className="flex h-11 items-center border-b px-3" />
    </div>
  );
}
