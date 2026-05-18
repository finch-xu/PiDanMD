import { Node, type JSONContent } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState, useEffect, useRef } from "react";
import "katex/dist/katex.min.css";
import { cn } from "~/lib/utils";
import {
  findMathInlineStart,
  tokenizeMathInline,
  renderMathInline,
} from "~/lib/markdown-serde";

function MathInlineView({ node, updateAttributes, selected }: any) {
  const [editing, setEditing] = useState(false);
  const [latex, setLatex] = useState(node.attrs.latex as string);
  const containerRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLatex(node.attrs.latex);
  }, [node.attrs.latex]);

  useEffect(() => {
    if (editing || !containerRef.current) return;
    const el = containerRef.current;
    let cancelled = false;
    import("katex").then((m) => {
      if (cancelled) return;
      try {
        m.default.render(latex, el, { displayMode: false, throwOnError: false });
      } catch {
        el.textContent = latex;
      }
    });
    return () => { cancelled = true; };
  }, [latex, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  if (editing) {
    return (
      <NodeViewWrapper as="span" className="math-inline math-inline--editing">
        <input
          ref={inputRef}
          className="math-inline__input"
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          onBlur={() => {
            updateAttributes({ latex });
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              e.preventDefault();
              updateAttributes({ latex });
              setEditing(false);
            }
          }}
        />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="span">
      <span
        className={cn("math-inline", selected && "math-inline--selected")}
        onDoubleClick={() => setEditing(true)}
        ref={containerRef}
      />
    </NodeViewWrapper>
  );
}

export const MathInline = Node.create({
  name: "mathInline",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      latex: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="math-inline"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", { ...HTMLAttributes, "data-type": "math-inline" }, 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathInlineView);
  },

  markdownTokenizer: {
    name: "mathInline",
    level: "inline" as const,
    start: findMathInlineStart,
    tokenize: tokenizeMathInline,
  },

  markdownTokenName: "mathInline",

  parseMarkdown(token: any) {
    return {
      type: "mathInline",
      attrs: { latex: token.text },
    } as JSONContent;
  },

  renderMarkdown(node: JSONContent) {
    return renderMathInline({ latex: node.attrs?.latex });
  },
});
